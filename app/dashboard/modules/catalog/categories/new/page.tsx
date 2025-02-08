import { CategoryForm } from '../../components/category-form';

export const metadata = {
  title: 'Nova Categoria | Catálogo Digital',
  description: 'Adicione uma nova categoria ao seu catálogo',
};

export default function NewCategoryPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Nova Categoria</h2>
        <p className="text-muted-foreground">
          Adicione uma nova categoria ao seu catálogo
        </p>
      </div>
      <CategoryForm />
    </div>
  );
}