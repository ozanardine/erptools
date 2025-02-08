import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Catálogo Digital | ERP Tools Hub',
  description: 'Gerencie seu catálogo de produtos',
};

async function getModuleStatus() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  // Verificar assinatura do módulo
  const { data: subscription } = await supabase
    .from('module_subscriptions')
    .select('*, modules(*)')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single();

  // Verificar integração ERP
  const { data: integration } = await supabase
    .from('erp_integrations')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('active', true)
    .single();

  return {
    subscription,
    integration,
    userId: session.user.id
  };
}

export default async function CatalogPage() {
  const { subscription, integration } = await getModuleStatus();

  if (!subscription) {
    redirect('/pricing');
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue={integration ? 'integration' : 'products'} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="integration">Integração</TabsTrigger>
          </TabsList>

          {!integration && (
            <Button variant="outline">
              Adicionar Produto
            </Button>
          )}
        </div>

        <TabsContent value="products" className="space-y-4">
          {integration ? (
            <Card>
              <CardHeader>
                <CardTitle>Produtos Sincronizados</CardTitle>
                <CardDescription>
                  Seus produtos são sincronizados automaticamente do {integration.erp_type.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Lista de produtos */}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>
                  Gerencie seus produtos manualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Lista de produtos */}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>
                Organize seus produtos em categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Lista de categorias */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração com ERP</CardTitle>
              <CardDescription>
                Conecte seu catálogo com seu sistema ERP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integration ? (
                <div className="space-y-4">
                  <p>Integrado com {integration.erp_type.toUpperCase()}</p>
                  <Button variant="destructive">
                    Remover Integração
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>Nenhuma integração configurada</p>
                  <Button>
                    Conectar com Tiny
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}