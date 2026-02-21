import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Brain,
  Dumbbell,
  Target,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              NS
            </div>
            <span className="text-lg font-semibold">NutriSports</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Comecar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Brain className="h-4 w-4" />
          Alimentado por Inteligencia Artificial
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Sua dieta personalizada,{" "}
          <span className="text-primary">sincronizada com seu treino</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          O NutriSports usa IA para gerar dietas semanais baseadas no seu plano
          de treino, objetivo e medidas corporais. Adaptacao automatica quando
          voce nao treina.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/cadastro">Comecar agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#como-funciona">Como funciona</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section
        id="como-funciona"
        className="border-t bg-muted/30 px-4 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Como funciona</h2>
            <p className="mt-3 text-muted-foreground">
              Tres passos simples para ter sua dieta personalizada
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">
                1. Importe seu treino
              </h3>
              <p className="text-sm text-muted-foreground">
                Suba sua planilha de treino (Excel, PDF ou foto). A IA
                identifica automaticamente os exercicios e estrutura seu plano
                semanal.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">
                2. Receba sua dieta
              </h3>
              <p className="text-sm text-muted-foreground">
                A IA calcula seu gasto basal, analisa seu treino e gera uma
                dieta semanal com refeicoes detalhadas para cada dia.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">
                3. Acompanhe e adapte
              </h3>
              <p className="text-sm text-muted-foreground">
                Registre suas medidas, marque se treinou e a dieta se ajusta
                automaticamente. Acompanhe sua evolucao com graficos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Para qualquer objetivo</h2>
            <p className="mt-3 text-muted-foreground">
              A IA adapta tudo ao seu objetivo principal
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingUp,
                title: "Performance",
                desc: "Maximize seus resultados esportivos com nutricao otimizada para treinos intensos.",
              },
              {
                icon: Target,
                title: "Emagrecimento",
                desc: "Deficit calorico inteligente que preserva massa muscular e garante energia.",
              },
              {
                icon: Activity,
                title: "Manutencao",
                desc: "Mantenha seu peso e composicao corporal com equilibrio nutricional.",
              },
              {
                icon: UtensilsCrossed,
                title: "Saude clinica",
                desc: "Dietas adaptadas para condicoes como diabetes, hipertensao e mais.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-xl border p-6"
              >
                <item.icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold">
            Comece sua transformacao hoje
          </h2>
          <p className="text-primary-foreground/80">
            Cadastre-se gratuitamente e tenha sua dieta personalizada em
            minutos.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/cadastro">Criar conta gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-muted-foreground">
          <p>NutriSports - Nutricao Inteligente para Atletas</p>
          <p>2026</p>
        </div>
      </footer>
    </div>
  );
}
