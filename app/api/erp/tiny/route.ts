import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { accessToken, refreshToken } = await req.json();

    // Criar ou atualizar integração
    const { data: integration, error } = await supabase
      .from('erp_integrations')
      .upsert({
        user_id: session.user.id,
        erp_type: 'tiny',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,erp_type'
      })
      .select()
      .single();

    if (error) throw error;

    // Criar configurações de sincronização padrão
    await supabase
      .from('sync_settings')
      .upsert({
        integration_id: integration.id,
        sync_products: true,
        sync_prices: true,
        sync_stock: true,
        sync_interval: '1 hour',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'integration_id'
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao configurar integração Tiny:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Desativar integração
    const { error } = await supabase
      .from('erp_integrations')
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .eq('erp_type', 'tiny');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover integração Tiny:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}