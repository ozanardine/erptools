import { notFound, redirect } from 'next/navigation';
import { queryUserSchema } from '@/lib/schema-helper';
import { CategoryForm } from '../../components/category-form';

export const metadata = {
  title: 'Editar Categoria | Catálogo Digital',
  description: 'Edite as informações da categoria',
};

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // Buscar categoria
    const { data: category } = await queryUserSchema('categories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!category) notFound();

    return (
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Editar Categoria</h2>
          <p className="text-muted-foreground">
            Atualize as informações da categoria
          </p>
        </div>
        <CategoryForm initialData={category} isEditing />
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar categoria:', error);
    redirect('/dashboard/modules/catalog/categories');
  }
}