"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Dumbbell, Coffee, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { TrainingDay } from "@/lib/types/training";

const DIAS_SEMANA = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

export default function TreinoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [todayLog, setTodayLog] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTraining();
  }, []);

  async function loadTraining() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load latest training plan
    const { data: plans } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      setPlanId(plans[0].id);
      const { data: days } = await supabase
        .from("training_days")
        .select("*")
        .eq("plan_id", plans[0].id)
        .order("dia_semana", { ascending: true });
      if (days) setTrainingDays(days as TrainingDay[]);
    }

    // Load today's log
    const today = new Date().toISOString().split("T")[0];
    const { data: log } = await supabase
      .from("training_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("data", today)
      .maybeSingle();

    if (log) setTodayLog(log.treinou);
    setLoadingData(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    try {
      const res = await fetch("/api/importar-treino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64,
          fileType: file.type,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao processar");
      }

      toast.success("Treino importado com sucesso!");
      setFile(null);
      await loadTraining();
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar treino");
    }
    setLoading(false);
  }

  async function handleTrainingLog(treinou: boolean) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase
      .from("training_logs")
      .upsert({
        user_id: user.id,
        data: today,
        treinou,
        training_plan_id: planId,
      }, { onConflict: "user_id,data" });

    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      setTodayLog(treinou);
      toast.success(treinou ? "Treino registrado!" : "Dia de descanso registrado!");
    }
  }

  const todayIndex = new Date().getDay();
  const todayTraining = trainingDays.find(d => d.dia_semana === todayIndex);

  return (
    <>
      <Header
        title="Plano de Treino"
        description="Importe sua planilha de treino para a IA estruturar"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Upload */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Importar Planilha de Treino</CardTitle>
            <CardDescription>
              Envie sua planilha de treino (Excel, PDF ou imagem). A IA vai
              identificar automaticamente os exercicios, series, repeticoes e
              montar seu plano semanal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-accent/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Clique para selecionar um arquivo</p>
                <p className="text-sm text-muted-foreground">
                  Excel (.xlsx, .xls), PDF ou imagem (JPG, PNG)
                </p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button onClick={handleUpload} disabled={loading} size="sm">
                  {loading ? "Processando IA..." : "Importar"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        {trainingDays.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Plano Semanal</CardTitle>
              <CardDescription>Extraido da sua planilha pela IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {DIAS_SEMANA.map((dia, i) => {
                  const day = trainingDays.find(d => d.dia_semana === i);
                  const isToday = i === todayIndex;
                  return (
                    <div
                      key={dia}
                      className={`rounded-lg border p-4 ${isToday ? "border-primary bg-primary/5" : ""} ${day?.eh_descanso ? "bg-muted/30" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{dia}</span>
                        {isToday && <Badge variant="default" className="text-xs">Hoje</Badge>}
                      </div>
                      {day && !day.eh_descanso ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Dumbbell className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-medium text-primary">{day.grupo_muscular}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {day.duracao_min}min | {day.intensidade} | ~{day.gasto_estimado_kcal} kcal
                          </p>
                          {Array.isArray(day.exercicios) && day.exercicios.length > 0 && (
                            <ul className="mt-2 space-y-0.5">
                              {(day.exercicios as any[]).slice(0, 4).map((ex, j) => (
                                <li key={j} className="text-xs text-muted-foreground">
                                  {ex.nome} - {ex.series}x{ex.repeticoes}
                                </li>
                              ))}
                              {(day.exercicios as any[]).length > 4 && (
                                <li className="text-xs text-muted-foreground">
                                  +{(day.exercicios as any[]).length - 4} exercicios
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      ) : day?.eh_descanso ? (
                        <div className="flex items-center gap-1.5">
                          <Coffee className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Descanso</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem treino definido</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Log */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Registro de Hoje - {DIAS_SEMANA[todayIndex]}</CardTitle>
            <CardDescription>
              {todayTraining && !todayTraining.eh_descanso
                ? `Treino planejado: ${todayTraining.grupo_muscular}`
                : "Dia de descanso planejado"}
              {todayLog !== null && (
                <span className="ml-2">
                  {todayLog
                    ? " | Voce ja registrou que treinou hoje"
                    : " | Voce registrou que nao treinou hoje"}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant={todayLog === true ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleTrainingLog(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Treinei hoje
            </Button>
            <Button
              variant={todayLog === false ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleTrainingLog(false)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Nao treinei
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
