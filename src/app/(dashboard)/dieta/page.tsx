"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Zap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { DietPlan, DietaDia, Refeicao } from "@/lib/types/diet";

const DIAS_SEMANA = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

export default function DietaPage() {
  const [diet, setDiet] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasMeasurement, setHasMeasurement] = useState(false);
  const [hasTraining, setHasTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<Record<number, "treino" | "descanso">>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, measurementRes, planRes, dietRes, logsRes] = await Promise.all([
      supabase.from("profiles").select("objetivo").eq("id", user.id).single(),
      supabase.from("measurements").select("id").eq("user_id", user.id).limit(1),
      supabase.from("training_plans").select("id").eq("user_id", user.id).limit(1),
      supabase.from("diet_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("training_logs").select("*").eq("user_id", user.id),
    ]);

    setHasProfile(!!profileRes.data?.objetivo);
    setHasMeasurement((measurementRes.data || []).length > 0);
    setHasTraining((planRes.data || []).length > 0);

    if (dietRes.data) setDiet(dietRes.data as DietPlan);

    // Build training logs map (dia_semana -> treinou)
    const logs: Record<number, boolean> = {};
    (logsRes.data || []).forEach((log: any) => {
      const d = new Date(log.data + "T12:00:00");
      logs[d.getDay()] = log.treinou;
    });
    setTrainingLogs(logs);

    // Default view mode based on training logs
    const mode: Record<number, "treino" | "descanso"> = {};
    for (let i = 0; i < 7; i++) {
      mode[i] = logs[i] === false ? "descanso" : "treino";
    }
    setViewMode(mode);

    setLoadingData(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/gerar-dieta", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao gerar dieta");
      }
      toast.success("Dieta gerada com sucesso!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
    setGenerating(false);
  }

  const canGenerate = hasProfile && hasMeasurement && hasTraining;

  function getDietForDay(diaSemana: number, mode: "treino" | "descanso"): DietaDia | null {
    if (!diet) return null;
    const list = mode === "treino" ? diet.dieta_treino : diet.dieta_descanso;
    if (!Array.isArray(list)) return null;
    return (list as DietaDia[]).find(d => d.dia_semana === diaSemana) || null;
  }

  if (loadingData) {
    return (
      <>
        <Header title="Dieta Semanal" description="Sua dieta personalizada baseada no treino" />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dieta Semanal" description="Sua dieta personalizada baseada no treino" />
      <div className="flex-1 space-y-6 p-6">
        {/* Generate button / status */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Gerar Dieta com IA</CardTitle>
            <CardDescription>
              {diet ? "Sua dieta foi gerada. Voce pode gerar novamente a qualquer momento." : "Para gerar sua dieta personalizada, complete os passos abaixo:"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!diet && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {hasProfile ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  <span className={`text-sm ${hasProfile ? "" : "text-muted-foreground"}`}>Perfil preenchido com objetivo definido</span>
                </div>
                <div className="flex items-center gap-3">
                  {hasMeasurement ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  <span className={`text-sm ${hasMeasurement ? "" : "text-muted-foreground"}`}>Pelo menos uma medicao corporal registrada</span>
                </div>
                <div className="flex items-center gap-3">
                  {hasTraining ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  <span className={`text-sm ${hasTraining ? "" : "text-muted-foreground"}`}>Plano de treino importado</span>
                </div>
              </div>
            )}
            <Button onClick={handleGenerate} disabled={!canGenerate || generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando dieta com IA...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  {diet ? "Gerar nova dieta" : "Gerar dieta com IA"}
                </>
              )}
            </Button>
            {diet && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Dia de treino: ~{diet.calorias_treino} kcal</span>
                <span>Dia de descanso: ~{diet.calorias_descanso} kcal</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diet display */}
        {diet && (
          <Tabs defaultValue="1">
            <TabsList className="w-full justify-start overflow-x-auto">
              {DIAS_SEMANA.map((dia, i) => (
                <TabsTrigger key={dia} value={String(i)} className="min-w-[90px]">
                  {dia}
                </TabsTrigger>
              ))}
            </TabsList>

            {DIAS_SEMANA.map((dia, i) => {
              const mode = viewMode[i] || "treino";
              const dietaDia = getDietForDay(i, mode);

              return (
                <TabsContent key={dia} value={String(i)} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{dia}</CardTitle>
                          <CardDescription>
                            {mode === "treino" ? "Dieta para dia de treino" : "Dieta para dia de descanso"}
                            {dietaDia && ` | ${dietaDia.calorias_total} kcal`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={mode === "treino" ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setViewMode(prev => ({ ...prev, [i]: "treino" }))}
                          >
                            Treino
                          </Badge>
                          <Badge
                            variant={mode === "descanso" ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setViewMode(prev => ({ ...prev, [i]: "descanso" }))}
                          >
                            Descanso
                          </Badge>
                        </div>
                      </div>
                      {dietaDia && (
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Proteina: {dietaDia.proteina_total_g}g</span>
                          <span>Carbo: {dietaDia.carboidrato_total_g}g</span>
                          <span>Gordura: {dietaDia.gordura_total_g}g</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {dietaDia && Array.isArray(dietaDia.refeicoes) ? (
                        <div className="space-y-4">
                          {dietaDia.refeicoes.map((refeicao: Refeicao, idx: number) => (
                            <div key={idx} className="rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{refeicao.nome_display}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{refeicao.calorias_total} kcal</span>
                              </div>
                              <div className="mt-3 space-y-1.5">
                                {(refeicao.alimentos || []).map((alimento, ai) => (
                                  <div key={ai} className="flex items-center justify-between text-sm">
                                    <span>{alimento.nome} <span className="text-muted-foreground">({alimento.quantidade})</span></span>
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                      <span>{alimento.proteina_g}g P</span>
                                      <span>{alimento.carboidrato_g}g C</span>
                                      <span>{alimento.gordura_g}g G</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-24 items-center justify-center text-muted-foreground">
                          Sem dieta para este dia
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </>
  );
}
