'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const tinyFormSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
});

type TinyFormValues = z.infer<typeof tinyFormSchema>;

export default function ERPIntegrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<TinyFormValues>({
    resolver: zodResolver(tinyFormSchema),
    defaultValues: {
      token: '',
    },
  });

  async function onSubmit(data: TinyFormValues) {
    try {
      setLoading(true);

      const response = await fetch('/api/erp/tiny/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: 'Integração configurada com sucesso!',
        description: 'Iniciando sincronização dos produtos...',
      });

      // Iniciar sincronização
      const syncResponse = await fetch('/api/erp/tiny/sync', {
        method: 'POST',
      });

      if (!syncResponse.ok) {
        throw new Error('Erro ao sincronizar produtos');
      }

      const syncResult = await syncResponse.json();

      toast({
        title: 'Sincronização concluída!',
        description: `${syncResult.processed} produtos processados, ${syncResult.failed} falhas.`,
      });

      router.refresh();
      router.push('/dashboard/modules/catalog/products');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao configurar integração',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Integração com Tiny ERP</h2>
        <p className="text-muted-foreground">
          Configure a integração com seu Tiny ERP
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurar Tiny ERP</CardTitle>
            <CardDescription>
              Insira seu token de acesso à API do Tiny ERP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de Acesso</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cole seu token aqui"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? 'Configurando...' : 'Configurar Integração'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}