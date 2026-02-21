"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, UtensilsCrossed, TrendingUp, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { calcularIMC, classificarIMC } from "@/utils/calculations";

interface DashboardData {
  nome: string;
  objetivo: string | null;
  pesoAtual: number | null;
  alturaAtual: number | null;
  caloriasHoje: number | null;
  treinoHoje: string | null;
  dietaAtiva: boolean;
  todayTreinou: boolean | null;
  hasProfile: boolean;
  hasMeasurement: boolean;
  hasTraining: boolean;
  hasDiet: boolean;
}

const OBJETIVO_LABELS: Record<string, string> = {
  performance: "Performance",
  emagrecimento: "Emagrecimento",
  manutencao: "Manutencao",
  clinico: "Saude Clinica",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const todayIndex = new Date().getDay();

    const [profileRes, measurementRes, planRes, dietRes, logRes, daysRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("measurements").select("*").eq("user_id", user.id).order("data", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("training_plans").select("id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("diet_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("training_logs").select("*").eq("user_id", user.id).eq("data", today).maybeSingle(),
      supabase.from("training_days").select("*"),
    ]);

    const profile = profileRes.data;
    const measurement = measurementRes.data;
    const plan = planRes.data;
    const diet = dietRes.data;
    const todayLog = logRes.data;

    let treinoHoje: string | null = null;
    if (plan && daysRes.data) {
      const todayDay = daysRes.data.find((d: any) => d.plan_id === plan.id && d.dia_semana === todayIndex);
      if (todayDay) {
        treinoHoje = todayDay.eh_descanso ? "Descanso" : todayDay.grupo_muscular;
      }
    }

    let caloriasHoje: number | null = null;
    if (diet) {
      const treinou = todayLog ? todayLog.treinou : true;
      const lista = treinou ? diet.dieta_treino : diet.dieta_descanso;
      if (Array.isArray(lista)) {
        const dia = (lista as any[]).find(d => d.dia_semana === todayIndex);
        caloriasHoje = dia?.calorias_total || (treinou ? diet.calorias_treino : diet.calorias_descanso);
      }
    }

    setData({
      nome: profile?.nome || "",
      objetivo: profile?.objetivo || null,
      pesoAtual: measurement?.peso_kg || null,
      alturaAtual: measurement?.altura_cm || null,
      caloriasHoje,
      treinoHoje,
      dietaAtiva: !!diet,
      todayTreinou: todayLog?.treinou ?? null,
      hasProfile: !!profile?.objetivo,
      hasMeasurement: !!measurement,
      hasTraining: !!plan,
      hasDiet: !!diet,
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Header title="Dashboard" description="Resumo da sua semana" />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  }

  const imc = data?.pesoAtual && data?.alturaAtual
    ? calcularIMC(data.pesoAtual, data.alturaAtual)
    : null;

  const allComplete = data?.hasProfile && data?.hasMeasurement && data?.hasTraining && data?.hasDiet;

  return (
    <>
      <Header
        title={data?.nome ? `Ola, ${data.nome.split(" ")[0]}` : "Dashboard"}
        description={data?.objetivo ? `Objetivo: ${OBJETIVO_LABELS[data.objetivo] || data.objetivo}` : "Resumo da sua semana"}
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calorias Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.caloriasHoje ? `${data.caloriasHoje.toLocaleString("pt-BR")}` : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.caloriasHoje ? "kcal planejadas" : "Gere sua dieta"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treino de Hoje</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.treinoHoje || "--"}</div>
              <p className="text-xs text-muted-foreground">
                {data?.todayTreinou === true && "Treinou hoje"}
                {data?.todayTreinou === false && "Nao treinou hoje"}
                {data?.todayTreinou === null && (data?.treinoHoje ? "Registre se treinou" : "Importe seu treino")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dieta Ativa</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.dietaAtiva ? "Sim" : "--"}</div>
              <p className="text-xs text-muted-foreground">
                {data?.dietaAtiva ? "Dieta personalizada ativa" : "Gere sua dieta"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.pesoAtual ? `${data.pesoAtual} kg` : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {imc ? `IMC ${imc} - ${classificarIMC(imc)}` : "Registre suas medidas"}
              </p>
            </CardContent>
          </Card>
        </div>

        {!allComplete && (
          <Card>
            <CardHeader>
              <CardTitle>Configure seu NutriSports</CardTitle>
              <CardDescription>Complete os passos para comecar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/perfil" className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent">
                  {data?.hasProfile
                    ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    : <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>}
                  <div>
                    <p className="font-medium">Complete seu perfil</p>
                    <p className="text-sm text-muted-foreground">Informe seus dados pessoais, objetivo e restricoes alimentares.</p>
                  </div>
                </Link>
                <Link href="/medidas" className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent">
                  {data?.hasMeasurement
                    ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    : <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>}
                  <div>
                    <p className="font-medium">Registre suas medidas</p>
                    <p className="text-sm text-muted-foreground">Peso, altura e circunferencias para acompanhar sua evolucao.</p>
                  </div>
                </Link>
                <Link href="/treino" className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent">
                  {data?.hasTraining
                    ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    : <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>}
                  <div>
                    <p className="font-medium">Importe seu plano de treino</p>
                    <p className="text-sm text-muted-foreground">Suba sua planilha e a IA vai identificar seus exercicios.</p>
                  </div>
                </Link>
                <Link href="/dieta" className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent">
                  {data?.hasDiet
                    ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    : <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</div>}
                  <div>
                    <p className="font-medium">Gere sua dieta personalizada</p>
                    <p className="text-sm text-muted-foreground">A IA vai criar uma dieta semanal baseada no seu treino e objetivo.</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {allComplete && (
          <Card>
            <CardHeader>
              <CardTitle>Tudo configurado!</CardTitle>
              <CardDescription>Seu NutriSports esta completo. Acesse sua dieta ou registre seus treinos diariamente.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Link href="/dieta"><Badge variant="default" className="cursor-pointer px-4 py-2 text-sm">Ver dieta de hoje</Badge></Link>
              <Link href="/treino"><Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm">Registrar treino</Badge></Link>
              <Link href="/medidas"><Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm">Atualizar medidas</Badge></Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
