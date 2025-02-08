'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { getSupabaseClient } from '@/lib/schema-helper';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const categorySchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: CategoryFormValues & { id: string };
  isEditing?: boolean;
}

export function CategoryForm({ initialData, isEditing }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      active: true,
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const schema = `client_${session.user.id.replace(/-/g, '_')}`;

      if (isEditing && initialData?.id) {
        // Atualizar categoria existente
        const { error } = await supabase
          .from(`${schema}.categories`)
          .update(data)
          .eq('id', initialData.id);

        if (error) throw error;

        toast({
          title: 'Categoria atualizada com sucesso!',
          description: 'As alterações foram salvas.',
        });
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from(`${schema}.categories`)
          .insert(data);

        if (error) throw error;

        toast({
          title: 'Categoria criada com sucesso!',
          description: 'A categoria foi adicionada ao seu catálogo.',
        });
      }

      router.refresh();
      router.push('/dashboard/modules/catalog/categories');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria`,
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome da categoria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição da categoria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Categoria ativa</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
        </Button>
      </form>
    </Form>
  );
}