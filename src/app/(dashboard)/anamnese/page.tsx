"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DOENCAS_COMUNS, ALERGIAS_COMUNS, SUPLEMENTOS_COMUNS } from "@/lib/types/anamnese";
import type { NivelAnamnese } from "@/lib/types/anamnese";
import { ClipboardList, Flame, Trophy, CheckCircle2 } from "lucide-react";

const NIVEIS = [
  {
    id: "basico" as NivelAnamnese,
    nome: "Basico",
    desc: "Dados essenciais: doencas, medicacoes, habitos alimentares e restricoes.",
    icon: ClipboardList,
    cor: "bg-blue-100 text-blue-700",
  },
  {
    id: "intermediario" as NivelAnamnese,
    nome: "Intermediario",
    desc: "Tudo do basico + suplementos, sono, estresse, preferencias e orcamento.",
    icon: Flame,
    cor: "bg-orange-100 text-orange-700",
  },
  {
    id: "ironman" as NivelAnamnese,
    nome: "Ironman",
    desc: "Anamnese completa: historico esportivo, composicao corporal, exames de sangue.",
    icon: Trophy,
    cor: "bg-red-100 text-red-700",
  },
];

export default function AnamnesePage() {
  const [nivel, setNivel] = useState<NivelAnamnese | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [existingAnamnese, setExistingAnamnese] = useState<any>(null);

  // Basico
  const [objetivoDetalhado, setObjetivoDetalhado] = useState("");
  const [historicoPeso, setHistoricoPeso] = useState("");
  const [doencas, setDoencas] = useState<string[]>([]);
  const [outrasDoencas, setOutrasDoencas] = useState("");
  const [usaMedicacao, setUsaMedicacao] = useState(false);
  const [medicacoes, setMedicacoes] = useState("");
  const [refeicoesPorDia, setRefeicoesPorDia] = useState(3);
  const [horarioPrimeira, setHorarioPrimeira] = useState("07:00");
  const [horarioUltima, setHorarioUltima] = useState("20:00");
  const [consumoAgua, setConsumoAgua] = useState(2);
  const [consomeAlcool, setConsomeAlcool] = useState("nunca");
  const [alergias, setAlergias] = useState<string[]>([]);
  const [intoleranciLactose, setIntoleranciaLactose] = useState(false);
  const [intoleranciaGluten, setIntoleranciaGluten] = useState(false);
  const [vegetarianoVegano, setVegetarianoVegano] = useState("nenhum");

  // Intermediario
  const [suplementos, setSuplementos] = useState<string[]>([]);
  const [usaSuplemento, setUsaSuplemento] = useState(false);
  const [horarioTreino, setHorarioTreino] = useState("");
  const [comeAntesTreino, setComeAntesTreino] = useState(false);
  const [comeAposTreino, setComeAposTreino] = useState(false);
  const [horasSono, setHorasSono] = useState(7);
  const [qualidadeSono, setQualidadeSono] = useState("regular");
  const [nivelEstresse, setNivelEstresse] = useState("medio");
  const [intestinal, setIntestinal] = useState("regular");
  const [alimentosGosta, setAlimentosGosta] = useState("");
  const [alimentosNaoGosta, setAlimentosNaoGosta] = useState("");
  const [cozinhaPropria, setCozinhaPropria] = useState(true);
  const [tempoPreparo, setTempoPreparo] = useState("medio");
  const [orcamento, setOrcamento] = useState("moderado");

  // Ironman
  const [tempoTreinoAnos, setTempoTreinoAnos] = useState(0);
  const [lesoesAnteriores, setLesoesAnteriores] = useState("");
  const [objetivoCompeticao, setObjetivoCompeticao] = useState("");
  const [freqTreino, setFreqTreino] = useState(0);
  const [periodizacao, setPeriodizacao] = useState("");
  const [fezBio, setFezBio] = useState(false);
  const [gorduraConhecida, setGorduraConhecida] = useState<string>("");
  const [metaGordura, setMetaGordura] = useState<string>("");
  const [fezDietaAntes, setFezDietaAntes] = useState(false);
  const [tipoDietaAnterior, setTipoDietaAnterior] = useState("");
  const [resultadoDieta, setResultadoDieta] = useState("");
  const [ultimoExame, setUltimoExame] = useState("");
  const [glicose, setGlicose] = useState<string>("");
  const [colesterol, setColesterol] = useState<string>("");
  const [triglicerideos, setTriglicerideos] = useState<string>("");
  const [hemoglobina, setHemoglobina] = useState<string>("");

  useEffect(() => { loadAnamnese(); }, []);

  async function loadAnamnese() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("anamneses").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setExistingAnamnese(data);
      setNivel(data.nivel);
      setObjetivoDetalhado(data.objetivo_detalhado || "");
      setHistoricoPeso(data.historico_peso || "");
      setDoencas(data.doencas || []);
      setOutrasDoencas(data.outras_doencas || "");
      setUsaMedicacao(data.usa_medicacao || false);
      setMedicacoes(data.medicacoes || "");
      setRefeicoesPorDia(data.refeicoes_por_dia || 3);
      setHorarioPrimeira(data.horario_primeira_refeicao || "07:00");
      setHorarioUltima(data.horario_ultima_refeicao || "20:00");
      setConsumoAgua(data.consumo_agua_litros || 2);
      setConsomeAlcool(data.consome_alcool || "nunca");
      setAlergias(data.alergias_alimentares || []);
      setIntoleranciaLactose(data.intolerancia_lactose || false);
      setIntoleranciaGluten(data.intolerancia_gluten || false);
      setVegetarianoVegano(data.vegetariano_vegano || "nenhum");
      setSuplementos(data.suplementos || []);
      setUsaSuplemento(data.usa_suplemento || false);
      setHorarioTreino(data.horario_treino || "");
      setComeAntesTreino(data.come_antes_treino || false);
      setComeAposTreino(data.come_apos_treino || false);
      setHorasSono(data.horas_sono || 7);
      setQualidadeSono(data.qualidade_sono || "regular");
      setNivelEstresse(data.nivel_estresse || "medio");
      setIntestinal(data.funcionamento_intestinal || "regular");
      setAlimentosGosta(data.alimentos_que_gosta || "");
      setAlimentosNaoGosta(data.alimentos_que_nao_gosta || "");
      setCozinhaPropria(data.cozinha_propria ?? true);
      setTempoPreparo(data.tempo_preparo_refeicao || "medio");
      setOrcamento(data.orcamento_alimentacao || "moderado");
      setTempoTreinoAnos(data.tempo_treino_anos || 0);
      setLesoesAnteriores(data.lesoes_anteriores || "");
      setObjetivoCompeticao(data.objetivo_competicao || "");
      setFreqTreino(data.frequencia_treino_semanal || 0);
      setPeriodizacao(data.tipo_periodizacao || "");
      setFezBio(data.ja_fez_bioimpedancia || false);
      setGorduraConhecida(data.percentual_gordura_conhecido?.toString() || "");
      setMetaGordura(data.meta_percentual_gordura?.toString() || "");
      setFezDietaAntes(data.ja_fez_dieta_antes || false);
      setTipoDietaAnterior(data.tipo_dieta_anterior || "");
      setResultadoDieta(data.resultado_dieta_anterior || "");
      setUltimoExame(data.ultimo_exame_sangue || "");
      setGlicose(data.glicose_jejum?.toString() || "");
      setColesterol(data.colesterol_total?.toString() || "");
      setTriglicerideos(data.triglicerideos?.toString() || "");
      setHemoglobina(data.hemoglobina?.toString() || "");
    }
    setLoadingData(false);
  }

  function toggleArray(arr: string[], item: string, setter: (v: string[]) => void) {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  }

  async function handleSubmit() {
    if (!nivel) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const payload = {
      user_id: user.id,
      nivel,
      objetivo_detalhado: objetivoDetalhado,
      historico_peso: historicoPeso,
      doencas, outras_doencas: outrasDoencas,
      usa_medicacao: usaMedicacao, medicacoes,
      refeicoes_por_dia: refeicoesPorDia,
      horario_primeira_refeicao: horarioPrimeira,
      horario_ultima_refeicao: horarioUltima,
      consumo_agua_litros: consumoAgua,
      consome_alcool: consomeAlcool,
      alergias_alimentares: alergias,
      intolerancia_lactose: intoleranciLactose,
      intolerancia_gluten: intoleranciaGluten,
      vegetariano_vegano: vegetarianoVegano,
      ...(nivel !== "basico" && {
        suplementos, usa_suplemento: usaSuplemento,
        horario_treino: horarioTreino,
        come_antes_treino: comeAntesTreino, come_apos_treino: comeAposTreino,
        horas_sono: horasSono, qualidade_sono: qualidadeSono,
        nivel_estresse: nivelEstresse, funcionamento_intestinal: intestinal,
        alimentos_que_gosta: alimentosGosta, alimentos_que_nao_gosta: alimentosNaoGosta,
        cozinha_propria: cozinhaPropria, tempo_preparo_refeicao: tempoPreparo,
        orcamento_alimentacao: orcamento,
      }),
      ...(nivel === "ironman" && {
        tempo_treino_anos: tempoTreinoAnos, lesoes_anteriores: lesoesAnteriores,
        objetivo_competicao: objetivoCompeticao, frequencia_treino_semanal: freqTreino,
        tipo_periodizacao: periodizacao, ja_fez_bioimpedancia: fezBio,
        percentual_gordura_conhecido: gorduraConhecida ? Number(gorduraConhecida) : null,
        meta_percentual_gordura: metaGordura ? Number(metaGordura) : null,
        ja_fez_dieta_antes: fezDietaAntes, tipo_dieta_anterior: tipoDietaAnterior,
        resultado_dieta_anterior: resultadoDieta, ultimo_exame_sangue: ultimoExame,
        glicose_jejum: glicose ? Number(glicose) : null,
        colesterol_total: colesterol ? Number(colesterol) : null,
        triglicerideos: triglicerideos ? Number(triglicerideos) : null,
        hemoglobina: hemoglobina ? Number(hemoglobina) : null,
      }),
      updated_at: new Date().toISOString(),
    };

    const { error } = existingAnamnese
      ? await supabase.from("anamneses").update(payload).eq("user_id", user.id)
      : await supabase.from("anamneses").insert(payload);

    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Anamnese salva com sucesso!");
      setExistingAnamnese(payload);
    }
    setLoading(false);
  }

  if (loadingData) {
    return (
      <>
        <Header title="Anamnese Nutricional" description="Questionario completo de saude" />
        <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>
      </>
    );
  }

  return (
    <>
      <Header title="Anamnese Nutricional" description="Quanto mais detalhada, melhor sera sua dieta personalizada" />
      <div className="flex-1 space-y-6 p-6 max-w-3xl">

        {/* Nivel selector */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de comprometimento</CardTitle>
            <CardDescription>Escolha o nivel de detalhamento da sua anamnese</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {NIVEIS.map((n) => (
                <div
                  key={n.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${nivel === n.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                  onClick={() => setNivel(n.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`rounded-md p-1.5 ${n.cor}`}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">{n.nome}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {nivel && (
          <>
            {/* ===== BASICO ===== */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Basico</Badge>
                  Saude e Habitos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Descreva seu objetivo em detalhes</Label>
                  <Textarea placeholder="Ex: Quero perder 10kg em 4 meses para uma maratona..." value={objetivoDetalhado} onChange={e => setObjetivoDetalhado(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Historico de peso</Label>
                  <Select value={historicoPeso} onValueChange={setHistoricoPeso}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sempre_magro">Sempre fui magro(a)</SelectItem>
                      <SelectItem value="sempre_acima">Sempre estive acima do peso</SelectItem>
                      <SelectItem value="engordou_recente">Engordei recentemente</SelectItem>
                      <SelectItem value="efeito_sanfona">Tenho efeito sanfona</SelectItem>
                      <SelectItem value="estavel">Peso relativamente estavel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
                <Label className="text-base font-semibold">Doencas diagnosticadas</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DOENCAS_COMUNS.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={doencas.includes(d)} onChange={() => toggleArray(doencas, d, setDoencas)} className="rounded" />
                      {d}
                    </label>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Outras doencas nao listadas</Label>
                  <Input value={outrasDoencas} onChange={e => setOutrasDoencas(e.target.value)} placeholder="Separe por virgula" />
                </div>

                <Separator />
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={usaMedicacao} onChange={() => setUsaMedicacao(!usaMedicacao)} className="rounded" />
                    <span className="text-sm font-medium">Uso medicacao atualmente</span>
                  </label>
                  {usaMedicacao && (
                    <Textarea value={medicacoes} onChange={e => setMedicacoes(e.target.value)} placeholder="Quais medicacoes e dosagens? Ex: Metformina 500mg 2x/dia" />
                  )}
                </div>

                <Separator />
                <Label className="text-base font-semibold">Habitos alimentares</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Refeicoes por dia</Label>
                    <Input type="number" min={1} max={10} value={refeicoesPorDia} onChange={e => setRefeicoesPorDia(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Consumo de agua (litros/dia)</Label>
                    <Input type="number" step="0.5" min={0} value={consumoAgua} onChange={e => setConsumoAgua(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Horario 1a refeicao</Label>
                    <Input type="time" value={horarioPrimeira} onChange={e => setHorarioPrimeira(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Horario ultima refeicao</Label>
                    <Input type="time" value={horarioUltima} onChange={e => setHorarioUltima(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Consumo de alcool</Label>
                  <Select value={consomeAlcool} onValueChange={setConsomeAlcool}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nunca">Nunca</SelectItem>
                      <SelectItem value="raramente">Raramente (1-2x/mes)</SelectItem>
                      <SelectItem value="socialmente">Socialmente (fins de semana)</SelectItem>
                      <SelectItem value="frequente">Frequentemente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
                <Label className="text-base font-semibold">Alergias alimentares</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALERGIAS_COMUNS.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={alergias.includes(a)} onChange={() => toggleArray(alergias, a, setAlergias)} className="rounded" />
                      {a}
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={intoleranciLactose} onChange={() => setIntoleranciaLactose(!intoleranciLactose)} className="rounded" />
                    Intolerancia a lactose
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={intoleranciaGluten} onChange={() => setIntoleranciaGluten(!intoleranciaGluten)} className="rounded" />
                    Intolerancia/sensibilidade ao gluten
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Dieta especial</Label>
                  <Select value={vegetarianoVegano} onValueChange={setVegetarianoVegano}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhuma (como de tudo)</SelectItem>
                      <SelectItem value="vegetariano">Vegetariano</SelectItem>
                      <SelectItem value="vegano">Vegano</SelectItem>
                      <SelectItem value="pescetariano">Pescetariano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* ===== INTERMEDIARIO ===== */}
            {(nivel === "intermediario" || nivel === "ironman") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-700">Intermediario</Badge>
                    Rotina e Preferencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={usaSuplemento} onChange={() => setUsaSuplemento(!usaSuplemento)} className="rounded" />
                      <span className="text-sm font-medium">Uso suplementos</span>
                    </label>
                    {usaSuplemento && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SUPLEMENTOS_COMUNS.map((s) => (
                          <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={suplementos.includes(s)} onChange={() => toggleArray(suplementos, s, setSuplementos)} className="rounded" />
                            {s}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />
                  <Label className="text-base font-semibold">Rotina de treino</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Horario habitual do treino</Label>
                      <Input type="time" value={horarioTreino} onChange={e => setHorarioTreino(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={comeAntesTreino} onChange={() => setComeAntesTreino(!comeAntesTreino)} className="rounded" />
                      Como antes do treino
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={comeAposTreino} onChange={() => setComeAposTreino(!comeAposTreino)} className="rounded" />
                      Como apos o treino
                    </label>
                  </div>

                  <Separator />
                  <Label className="text-base font-semibold">Sono e Estresse</Label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Horas de sono</Label>
                      <Input type="number" step="0.5" min={3} max={12} value={horasSono} onChange={e => setHorasSono(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Qualidade do sono</Label>
                      <Select value={qualidadeSono} onValueChange={setQualidadeSono}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boa">Boa</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="ruim">Ruim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nivel de estresse</Label>
                      <Select value={nivelEstresse} onValueChange={setNivelEstresse}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixo">Baixo</SelectItem>
                          <SelectItem value="medio">Medio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Funcionamento intestinal</Label>
                    <Select value={intestinal} onValueChange={setIntestinal}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular (1-2x/dia)</SelectItem>
                        <SelectItem value="constipacao">Constipacao (prisao de ventre)</SelectItem>
                        <SelectItem value="diarreia">Diarreia frequente</SelectItem>
                        <SelectItem value="alternado">Alternado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  <Label className="text-base font-semibold">Preferencias</Label>
                  <div className="space-y-2">
                    <Label>Alimentos que voce gosta</Label>
                    <Textarea value={alimentosGosta} onChange={e => setAlimentosGosta(e.target.value)} placeholder="Ex: frango, arroz, banana, ovos..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Alimentos que voce NAO gosta</Label>
                    <Textarea value={alimentosNaoGosta} onChange={e => setAlimentosNaoGosta(e.target.value)} placeholder="Ex: figado, beterraba, quiabo..." />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Cozinha propria?</Label>
                      <Select value={cozinhaPropria ? "sim" : "nao"} onValueChange={v => setCozinhaPropria(v === "sim")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim, cozinho em casa</SelectItem>
                          <SelectItem value="nao">Nao, como fora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tempo para preparar</Label>
                      <Select value={tempoPreparo} onValueChange={setTempoPreparo}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rapido">Rapido (ate 15min)</SelectItem>
                          <SelectItem value="medio">Medio (15-30min)</SelectItem>
                          <SelectItem value="sem_limite">Sem limite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Orcamento alimentacao</Label>
                      <Select value={orcamento} onValueChange={setOrcamento}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economico">Economico</SelectItem>
                          <SelectItem value="moderado">Moderado</SelectItem>
                          <SelectItem value="sem_limite">Sem limite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ===== IRONMAN ===== */}
            {nivel === "ironman" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-700">Ironman</Badge>
                    Historico Esportivo e Exames
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Label className="text-base font-semibold">Historico esportivo</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tempo de treino (anos)</Label>
                      <Input type="number" min={0} value={tempoTreinoAnos} onChange={e => setTempoTreinoAnos(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequencia semanal de treino</Label>
                      <Input type="number" min={0} max={14} value={freqTreino} onChange={e => setFreqTreino(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Lesoes anteriores</Label>
                    <Textarea value={lesoesAnteriores} onChange={e => setLesoesAnteriores(e.target.value)} placeholder="Descreva lesoes relevantes..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Objetivo de competicao</Label>
                    <Input value={objetivoCompeticao} onChange={e => setObjetivoCompeticao(e.target.value)} placeholder="Ex: Maratona em outubro, Ironman 70.3..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de periodizacao (se souber)</Label>
                    <Input value={periodizacao} onChange={e => setPeriodizacao(e.target.value)} placeholder="Ex: Linear, Ondulada, Block..." />
                  </div>

                  <Separator />
                  <Label className="text-base font-semibold">Composicao corporal</Label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={fezBio} onChange={() => setFezBio(!fezBio)} className="rounded" />
                    Ja fiz bioimpedancia
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>% Gordura atual (se souber)</Label>
                      <Input type="number" step="0.1" value={gorduraConhecida} onChange={e => setGorduraConhecida(e.target.value)} placeholder="Ex: 18.5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta de % gordura</Label>
                      <Input type="number" step="0.1" value={metaGordura} onChange={e => setMetaGordura(e.target.value)} placeholder="Ex: 12.0" />
                    </div>
                  </div>

                  <Separator />
                  <Label className="text-base font-semibold">Dietas anteriores</Label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={fezDietaAntes} onChange={() => setFezDietaAntes(!fezDietaAntes)} className="rounded" />
                    Ja fiz dieta com nutricionista
                  </label>
                  {fezDietaAntes && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tipo de dieta</Label>
                        <Input value={tipoDietaAnterior} onChange={e => setTipoDietaAnterior(e.target.value)} placeholder="Ex: Low carb, Cetogenica, Flexivel..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Resultado</Label>
                        <Select value={resultadoDieta} onValueChange={setResultadoDieta}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="otimo">Otimo, atingi o objetivo</SelectItem>
                            <SelectItem value="parcial">Parcial, algum resultado</SelectItem>
                            <SelectItem value="nenhum">Nenhum resultado</SelectItem>
                            <SelectItem value="piorou">Piorou / engordei depois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <Separator />
                  <Label className="text-base font-semibold">Exames de sangue recentes</Label>
                  <div className="space-y-2">
                    <Label>Data do ultimo exame</Label>
                    <Input type="date" value={ultimoExame} onChange={e => setUltimoExame(e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Glicose jejum (mg/dL)</Label>
                      <Input type="number" value={glicose} onChange={e => setGlicose(e.target.value)} placeholder="Ex: 92" />
                    </div>
                    <div className="space-y-2">
                      <Label>Colesterol total (mg/dL)</Label>
                      <Input type="number" value={colesterol} onChange={e => setColesterol(e.target.value)} placeholder="Ex: 185" />
                    </div>
                    <div className="space-y-2">
                      <Label>Triglicerideos (mg/dL)</Label>
                      <Input type="number" value={triglicerideos} onChange={e => setTriglicerideos(e.target.value)} placeholder="Ex: 120" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hemoglobina (g/dL)</Label>
                      <Input type="number" step="0.1" value={hemoglobina} onChange={e => setHemoglobina(e.target.value)} placeholder="Ex: 14.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save */}
            <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full">
              {loading ? "Salvando anamnese..." : existingAnamnese ? "Atualizar anamnese" : "Salvar anamnese"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
