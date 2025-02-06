'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Básico',
    price: 'R$ 97/mês',
    description: 'Perfeito para pequenas empresas começando com automação.',
    features: [
      'Integração com Tiny ERP',
      'Gestão de Pedidos',
      'Relatórios Básicos',
      'Suporte por Email',
    ],
    planId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
  },
  {
    name: 'Profissional',
    price: 'R$ 197/mês',
    description: 'Ideal para empresas em crescimento que precisam de mais recursos.',
    features: [
      'Tudo do plano Básico',
      'Gestão de Notas Fiscais',
      'Relatórios Avançados',
      'Suporte Prioritário',
      'API de Integração',
    ],
    planId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    popular: true,
  },
  {
    name: 'Empresarial',
    price: 'R$ 497/mês',
    description: 'Para empresas que precisam do máximo em automação e suporte.',
    features: [
      'Tudo do plano Profissional',
      'Múltiplas Contas de ERP',
      'Consultoria Dedicada',
      'SLA Garantido',
      'Customizações Exclusivas',
    ],
    planId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
  },
];

export default function PricingPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao processar assinatura',
        description: 'Por favor, tente novamente mais tarde.',
      });
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
        <p className="text-xl text-muted-foreground">
          Escolha o plano ideal para o seu negócio
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary' : ''}`}>
            <CardHeader>
              {plan.popular && (
                <div className="text-sm font-medium text-primary mb-2">Mais Popular</div>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-6">{plan.price}</div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.planId!)}
              >
                Assinar {plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}