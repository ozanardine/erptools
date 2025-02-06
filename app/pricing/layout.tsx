import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços | ERP Tools Hub',
  description: 'Escolha o plano ideal para automatizar seu negócio com o ERP Tools Hub.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}