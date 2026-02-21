"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Objetivo, Sexo, NivelAtividade } from "@/lib/types/profile";

export default function PerfilPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState<Sexo | "">("");
  const [objetivo, setObjetivo] = useState<Objetivo | "">("");
  const [nivelAtividade, setNivelAtividade] = useState<NivelAtividade | "">("");
  const [condicoes, setCondicoes] = useState("");
  const [restricoes, setRestricoes] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setNome(data.nome || "");
      setDataNascimento(data.data_nascimento || "");
      setSexo(data.sexo || "");
      setObjetivo(data.objetivo || "");
      setNivelAtividade(data.nivel_atividade || "");
      setCondicoes((data.condicoes_clinicas || []).join(", "));
      setRestricoes((data.restricoes_alimentares || []).join(", "));
    }
    setLoadingData(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Voce precisa estar logado");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nome,
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        objetivo: objetivo || null,
        nivel_atividade: nivelAtividade || null,
        condicoes_clinicas: condicoes ? condicoes.split(",").map(s => s.trim()).filter(Boolean) : [],
        restricoes_alimentares: restricoes ? restricoes.split(",").map(s => s.trim()).filter(Boolean) : [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Perfil salvo com sucesso!");
    }
    setLoading(false);
  }

  if (loadingData) {
    return (
      <>
        <Header title="Perfil" description="Seus dados pessoais e objetivo" />
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Perfil" description="Seus dados pessoais e objetivo" />
      <div className="flex-1 p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Essas informacoes serao usadas para calcular seu gasto energetico e
              personalizar sua dieta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo biologico</Label>
                  <Select value={sexo} onValueChange={(v) => setSexo(v as Sexo)}>
                    <SelectTrigger id="sexo">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel_atividade">Nivel de atividade</Label>
                  <Select value={nivelAtividade} onValueChange={(v) => setNivelAtividade(v as NivelAtividade)}>
                    <SelectTrigger id="nivel_atividade">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentario">Sedentario</SelectItem>
                      <SelectItem value="leve">Levemente ativo</SelectItem>
                      <SelectItem value="moderado">Moderadamente ativo</SelectItem>
                      <SelectItem value="intenso">Muito ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo principal</Label>
                <Select value={objetivo} onValueChange={(v) => setObjetivo(v as Objetivo)}>
                  <SelectTrigger id="objetivo">
                    <SelectValue placeholder="Selecione seu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance esportiva</SelectItem>
                    <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                    <SelectItem value="manutencao">Manutencao do peso</SelectItem>
                    <SelectItem value="clinico">Melhoria das condicoes clinicas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicoes">Condicoes clinicas (opcional)</Label>
                <Input
                  id="condicoes"
                  placeholder="Ex: diabetes, hipertensao (separar por virgula)"
                  value={condicoes}
                  onChange={(e) => setCondicoes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restricoes">Restricoes alimentares (opcional)</Label>
                <Input
                  id="restricoes"
                  placeholder="Ex: vegano, sem gluten, alergia a amendoim"
                  value={restricoes}
                  onChange={(e) => setRestricoes(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
