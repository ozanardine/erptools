import { notFound, redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/schema-helper';
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
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const schema = `client_${session.user.id.replace(/-/g, '_')}`;

    // Buscar categoria
    const { data: category } = await supabase
      .from(`${schema}.categories`)
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