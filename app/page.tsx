import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { BoxesIcon, BarChart3Icon, LayersIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BoxesIcon className="h-6 w-6" />
            <span className="font-bold text-xl">ERP Tools Hub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden sm:inline-flex">Sobre</Button>
            <Button variant="ghost" className="hidden sm:inline-flex">Preços</Button>
            <Button variant="ghost" className="hidden sm:inline-flex">Contato</Button>
            <Link href="/auth/login">
              <Button>Entrar</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Ferramentas de Integração ERP
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Otimize suas operações comerciais com nossas ferramentas modulares de ERP. Comece com a integração Tiny ERP e expanda conforme seu crescimento.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">Começar Agora</Button>
            </Link>
            <Button size="lg" variant="outline">Ver Demo</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos Principais</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <BarChart3Icon className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Painel Analítico</h3>
              <p className="text-muted-foreground">
                Ferramentas completas de análise e relatórios para acompanhar o desempenho do seu negócio.
              </p>
            </Card>
            <Card className="p-6">
              <LayersIcon className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Integração Modular</h3>
              <p className="text-muted-foreground">
                Escolha e personalize os módulos que se adequam às necessidades do seu negócio.
              </p>
            </Card>
            <Card className="p-6">
              <BoxesIcon className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Suporte Multi-ERP</h3>
              <p className="text-muted-foreground">
                Começando com Tiny ERP, com mais integrações em breve.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}