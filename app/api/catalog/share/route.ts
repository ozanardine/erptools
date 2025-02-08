import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, expiresIn } = await req.json();

    // Calcular data de expiração
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null;

    // Criar token de compartilhamento
    const { data: shareToken, error } = await supabase.rpc('generate_share_token')
      .then(async ({ data: token }) => {
        return await supabase
          .from('catalog_share_tokens')
          .insert({
            user_id: session.user.id,
            token,
            name,
            expires_at: expiresAt,
            created_by: session.user.id,
          })
          .select()
          .single();
      });

    if (error) throw error;

    return NextResponse.json(shareToken);
  } catch (error) {
    console.error('Erro ao criar token de compartilhamento:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Buscar tokens ativos
    const { data: tokens, error } = await supabase
      .from('catalog_share_tokens')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Erro ao buscar tokens:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tokenId } = await req.json();

    // Remover token
    const { error } = await supabase
      .from('catalog_share_tokens')
      .delete()
      .eq('id', tokenId)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover token:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}