import { notFound, redirect } from 'next/navigation';
import { queryUserSchema } from '@/lib/schema-helper';
import { ProductForm } from '../../components/product-form';

export const metadata = {
  title: 'Editar Produto | Catálogo Digital',
  description: 'Edite as informações do produto',
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // Buscar produto e categorias
    const [{ data: product }, { data: categories }] = await Promise.all([
      queryUserSchema('products')
        .select('*')
        .eq('id', params.id)
        .single(),
      queryUserSchema('categories')
        .select('id, name')
        .eq('active', true)
        .order('name'),
    ]);

    if (!product) notFound();

    return (
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Editar Produto</h2>
          <p className="text-muted-foreground">
            Atualize as informações do produto
          </p>
        </div>
        <ProductForm 
          categories={categories || []} 
          initialData={{
            ...product,
            sale_price: product.sale_price.toString(),
            promotional_price: product.promotional_price?.toString() || '',
          }}
          isEditing
        />
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    redirect('/dashboard/modules/catalog/products');
  }
}