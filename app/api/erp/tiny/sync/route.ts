import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { queryUserSchema } from '@/lib/schema-helper';

async function fetchTinyProducts(token: string, page = 1) {
  const response = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      formato: 'json',
      pesquisa: '',
      pagina: page,
    }),
  });

  return response.json();
}

export async function POST(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Buscar integração ativa
    const { data: integration } = await supabase
      .from('erp_integrations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('erp_type', 'tiny')
      .eq('active', true)
      .single();

    if (!integration) {
      return new NextResponse('No active integration', { status: 400 });
    }

    // Iniciar log de sincronização
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        integration_id: integration.id,
        status: 'partial',
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
      })
      .select()
      .single();

    let page = 1;
    let totalProcessed = 0;
    let totalFailed = 0;
    let hasMore = true;

    const products = queryUserSchema('products');

    while (hasMore) {
      const data = await fetchTinyProducts(integration.access_token, page);
      
      if (data.retorno.status === 'Erro') {
        throw new Error(data.retorno.registros);
      }

      const items = data.retorno.produtos || [];
      hasMore = items.length === 100; // Tiny retorna 100 itens por página

      for (const item of items) {
        try {
          const product = item.produto;
          
          // Atualizar ou criar produto
          await products.upsert({
            erp_id: product.id,
            title: product.nome,
            description: product.descricao,
            sale_price: Number(product.preco),
            promotional_price: product.preco_promocional ? Number(product.preco_promocional) : null,
            active: product.situacao === 'A',
            source: 'erp',
            last_sync: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'erp_id'
          });

          totalProcessed++;
        } catch (error) {
          console.error('Erro ao processar produto:', error);
          totalFailed++;
        }
      }

      page++;
    }

    // Atualizar log de sincronização
    await supabase
      .from('sync_logs')
      .update({
        status: totalFailed === 0 ? 'success' : 'partial',
        items_processed: totalProcessed,
        items_failed: totalFailed,
        finished_at: new Date().toISOString(),
      })
      .eq('id', syncLog.id);

    // Atualizar última sincronização
    await supabase
      .from('erp_integrations')
      .update({
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      failed: totalFailed,
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}