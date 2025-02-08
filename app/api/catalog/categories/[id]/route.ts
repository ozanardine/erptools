import { NextResponse } from 'next/server';
import { queryUserSchema } from '@/lib/schema-helper';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const categories = await queryUserSchema('categories');

    // Atualizar categoria
    const { error } = await categories
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await queryUserSchema('categories');

    // Remover categoria
    const { error } = await categories.delete().eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}