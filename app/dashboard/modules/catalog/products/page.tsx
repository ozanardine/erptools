import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { queryUserSchema } from '@/lib/schema-helper';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import { columns } from './columns';

export const metadata: Metadata = {
  title: 'Produtos | Catálogo Digital',
  description: 'Gerencie seus produtos',
};

export default async function ProductsPage() {
  try {
    // Buscar produtos do schema do usuário
    const { data: products, error } = await queryUserSchema('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Produtos</h2>
            <p className="text-muted-foreground">
              Gerencie os produtos do seu catálogo
            </p>
          </div>
          <Link href="/dashboard/modules/catalog/products/new">
            <Button>Novo Produto</Button>
          </Link>
        </div>
        <DataTable columns={columns} data={products || []} />
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    redirect('/auth/login');
  }
}