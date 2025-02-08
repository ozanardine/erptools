import { redirect } from 'next/navigation';
import { queryUserSchema } from '@/lib/schema-helper';
import { ProductForm } from '../../components/product-form';

export const metadata = {
  title: 'Novo Produto | Catálogo Digital',
  description: 'Adicione um novo produto ao seu catálogo',
};

export default async function NewProductPage() {
  try {
    // Buscar categorias do usuário
    const { data: categories, error } = await queryUserSchema('categories')
      .select('id, name')
      .eq('active', true)
      .order('name');

    if (error) throw error;

    return (
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Novo Produto</h2>
          <p className="text-muted-foreground">
            Adicione um novo produto ao seu catálogo
          </p>
        </div>
        <ProductForm categories={categories} />
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    redirect('/dashboard/modules/catalog');
  }
}