"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function PerfilPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      toast.success("Perfil salvo com sucesso!");
      setLoading(false);
    }, 1000);
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
                  <Input id="nome" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input id="data_nascimento" type="date" required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo biologico</Label>
                  <Select required>
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
                  <Select required>
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
                <Select required>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restricoes">Restricoes alimentares (opcional)</Label>
                <Input
                  id="restricoes"
                  placeholder="Ex: vegano, sem gluten, alergia a amendoim"
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
