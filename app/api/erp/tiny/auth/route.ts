import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { token } = await req.json();

    // Verificar se o token é válido fazendo uma requisição de teste
    const response = await fetch('https://api.tiny.com.br/api2/produtos.pesquisa.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        formato: 'json',
        pesquisa: '',
        pagina: 1,
      }),
    });

    const data = await response.json();
    if (data.retorno.status === 'Erro') {
      return new NextResponse('Invalid Token', { status: 400 });
    }

    // Criar ou atualizar integração
    const { error } = await supabase
      .from('erp_integrations')
      .upsert({
        user_id: session.user.id,
        erp_type: 'tiny',
        access_token: token,
        active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,erp_type'
      });

    if (error) throw error;

    // Criar configurações de sincronização padrão
    await supabase
      .from('sync_settings')
      .insert({
        integration_id: session.user.id,
        sync_products: true,
        sync_prices: true,
        sync_stock: false,
        sync_interval: '1 hour',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao configurar integração Tiny:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}