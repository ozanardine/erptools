import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/schema-helper';
import { Button } from '@/components/ui/button';
import { DataTable } from '../products/data-table';
import { columns } from './columns';

export const metadata: Metadata = {
  title: 'Categorias | Catálogo Digital',
  description: 'Gerencie suas categorias',
};

export default async function CategoriesPage() {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const schema = `client_${session.user.id.replace(/-/g, '_')}`;

    // Buscar categorias do schema do usuário
    const { data: categories, error } = await supabase
      .from(`${schema}.categories`)
      .select('*')
      .order('name');

    if (error) throw error;

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
            <p className="text-muted-foreground">
              Gerencie as categorias do seu catálogo
            </p>
          </div>
          <Link href="/dashboard/modules/catalog/categories/new">
            <Button>Nova Categoria</Button>
          </Link>
        </div>
        <DataTable columns={columns} data={categories || []} />
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    redirect('/auth/login');
  }
}