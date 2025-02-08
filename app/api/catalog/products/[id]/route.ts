import { NextResponse } from 'next/server';
import { queryUserSchema } from '@/lib/schema-helper';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const products = await queryUserSchema('products');

    // Atualizar produto
    const { error } = await products
      .update({
        ...data,
        sale_price: Number(data.sale_price),
        promotional_price: data.promotional_price ? Number(data.promotional_price) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const products = await queryUserSchema('products');

    // Remover produto
    const { error } = await products.delete().eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}