import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

interface CatalogPageProps {
  params: {
    token: string;
  };
}

export const metadata: Metadata = {
  title: 'Catálogo Digital',
  description: 'Visualize nosso catálogo de produtos',
};

async function validateAccess(token: string) {
  // Buscar informações do token
  const { data: tokenData } = await supabase
    .from('catalog_share_tokens')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!tokenData) return null;

  // Verificar expiração
  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return null;
  }

  // Atualizar último acesso
  await supabase
    .from('catalog_share_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token);

  return tokenData.user_id;
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const userId = await validateAccess(params.token);
  if (!userId) notFound();

  const schemaName = `client_${userId.replace(/-/g, '_')}`;

  // Buscar produtos do usuário
  const { data: products } = await supabase
    .from(`${schemaName}.products`)
    .select(`
      *,
      category:${schemaName}.categories(name),
      images:${schemaName}.product_images(url, order_index)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-lg border bg-white shadow-md transition-all hover:shadow-lg"
            >
              {/* Imagem Principal */}
              <div className="aspect-square overflow-hidden bg-gray-100">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Informações do Produto */}
              <div className="p-4">
                {product.category && (
                  <p className="text-sm text-muted-foreground">
                    {product.category.name}
                  </p>
                )}
                <h3 className="mt-1 font-semibold">{product.title}</h3>
                <div className="mt-2 space-y-1">
                  {product.promotional_price ? (
                    <>
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.sale_price)}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(product.promotional_price)}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(product.sale_price)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}