'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const shareFormSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  expiresIn: z.string().optional(),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

interface ShareToken {
  id: string;
  name: string;
  token: string;
  expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
}

export default function CatalogSharePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      name: '',
      expiresIn: undefined,
    },
  });

  // Carregar configurações e tokens
  useEffect(() => {
    async function loadData() {
      try {
        // Carregar configurações do catálogo
        const { data: settings } = await supabase
          .from('catalog_settings')
          .select('is_public')
          .single();

        if (settings) {
          setIsPublic(settings.is_public);
        }

        // Carregar tokens
        const { data: shareTokens } = await fetch('/api/catalog/share').then(res => res.json());
        if (shareTokens) {
          setTokens(shareTokens);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }

    loadData();
  }, []);

  // Atualizar visibilidade do catálogo
  async function toggleVisibility() {
    try {
      const newValue = !isPublic;
      const { error } = await supabase
        .from('catalog_settings')
        .update({ is_public: newValue })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      setIsPublic(newValue);
      toast({
        title: 'Configurações atualizadas',
        description: `Catálogo ${newValue ? 'público' : 'privado'}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar configurações',
        description: 'Tente novamente mais tarde.',
      });
    }
  }

  // Criar novo token
  async function onSubmit(data: ShareFormValues) {
    try {
      setLoading(true);

      const expiresIn = data.expiresIn ? {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[data.expiresIn] : undefined;

      const response = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, expiresIn }),
      });

      if (!response.ok) throw new Error('Erro ao criar token');

      const newToken = await response.json();
      setTokens([newToken, ...tokens]);
      form.reset();

      toast({
        title: 'Token criado com sucesso!',
        description: 'O link de compartilhamento foi gerado.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar token',
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  }

  // Remover token
  async function removeToken(tokenId: string) {
    try {
      const response = await fetch('/api/catalog/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });

      if (!response.ok) throw new Error('Erro ao remover token');

      setTokens(tokens.filter(t => t.id !== tokenId));
      toast({
        title: 'Token removido',
        description: 'O link de compartilhamento foi desativado.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover token',
        description: 'Tente novamente mais tarde.',
      });
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Compartilhamento</h2>
        <p className="text-muted-foreground">
          Gerencie o acesso ao seu catálogo
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configurações de Visibilidade */}
        <Card>
          <CardHeader>
            <CardTitle>Visibilidade do Catálogo</CardTitle>
            <CardDescription>
              Defina se seu catálogo será público ou privado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Switch
                checked={isPublic}
                onCheckedChange={toggleVisibility}
              />
              <div className="space-y-1">
                <p className="font-medium">
                  {isPublic ? 'Público' : 'Privado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? 'Qualquer pessoa pode acessar seu catálogo'
                    : 'Apenas pessoas com link de convite podem acessar'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Compartilhamento */}
        {!isPublic && (
          <Card>
            <CardHeader>
              <CardTitle>Gerar Link de Compartilhamento</CardTitle>
              <CardDescription>
                Crie links de acesso ao seu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cliente A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiresIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiração</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nunca expira</SelectItem>
                            <SelectItem value="1d">1 dia</SelectItem>
                            <SelectItem value="7d">7 dias</SelectItem>
                            <SelectItem value="30d">30 dias</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Gerando...' : 'Gerar Link'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Links Ativos */}
        {!isPublic && tokens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Links Ativos</CardTitle>
              <CardDescription>
                Gerencie os links de compartilhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(token.created_at).toLocaleDateString()}
                        {token.expires_at && ` • Expira em: ${new Date(token.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/catalog/${token.token}`
                          );
                          toast({
                            title: 'Link copiado!',
                            description: 'O link foi copiado para sua área de transferência.',
                          });
                        }}
                      >
                        Copiar Link
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => removeToken(token.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}