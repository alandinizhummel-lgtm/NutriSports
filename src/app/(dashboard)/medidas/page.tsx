"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Measurement } from "@/lib/types/measurement";
import { calcularIMC, classificarIMC } from "@/utils/calculations";
import { formatarData } from "@/utils/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Trash2 } from "lucide-react";

export default function MedidasPage() {
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, []);

  async function loadMeasurements() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: true });

    if (data) setMeasurements(data as Measurement[]);
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

    const form = e.currentTarget;
    const formData = new FormData(form);

    const { error } = await supabase.from("measurements").insert({
      user_id: user.id,
      peso_kg: Number(formData.get("peso_kg")),
      altura_cm: Number(formData.get("altura_cm")),
      circ_abdominal_cm: formData.get("circ_abdominal") ? Number(formData.get("circ_abdominal")) : null,
      circ_coxa_cm: formData.get("circ_coxa") ? Number(formData.get("circ_coxa")) : null,
      circ_braco_cm: formData.get("circ_braco") ? Number(formData.get("circ_braco")) : null,
      circ_tornozelo_cm: formData.get("circ_tornozelo") ? Number(formData.get("circ_tornozelo")) : null,
      gordura_percentual: formData.get("gordura") ? Number(formData.get("gordura")) : null,
    });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Medidas registradas com sucesso!");
      form.reset();
      await loadMeasurements();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("measurements").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao deletar: " + error.message);
    } else {
      toast.success("Medicao removida");
      await loadMeasurements();
    }
  }

  const lastMeasurement = measurements[measurements.length - 1];
  const imc = lastMeasurement
    ? calcularIMC(lastMeasurement.peso_kg, lastMeasurement.altura_cm)
    : null;

  const chartData = measurements.map((m) => ({
    data: formatarData(m.data),
    Peso: m.peso_kg,
    "Circ. Abdominal": m.circ_abdominal_cm,
    "Circ. Braco": m.circ_braco_cm,
    "Circ. Coxa": m.circ_coxa_cm,
  }));

  return (
    <>
      <Header
        title="Medidas Corporais"
        description="Registre suas medidas para acompanhar a evolucao"
      />
      <div className="flex-1 space-y-6 p-6">
        {/* IMC Card */}
        {imc !== null && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">IMC Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{imc}</div>
                <Badge variant="secondary" className="mt-1">{classificarIMC(imc)}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lastMeasurement.peso_kg} kg</div>
                {measurements.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const diff = lastMeasurement.peso_kg - measurements[measurements.length - 2].peso_kg;
                      return diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`;
                    })()}{" "}
                    desde a ultima medicao
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Medicoes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{measurements.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Nova Medicao</CardTitle>
            <CardDescription>
              Registre suas medidas atuais. Os campos opcionais ajudam a ter um
              acompanhamento mais detalhado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="peso_kg">Peso (kg) *</Label>
                  <Input name="peso_kg" id="peso_kg" type="number" step="0.1" placeholder="75.5" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura_cm">Altura (cm) *</Label>
                  <Input
                    name="altura_cm"
                    id="altura_cm"
                    type="number"
                    step="0.1"
                    placeholder="175"
                    defaultValue={lastMeasurement?.altura_cm || ""}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="circ_abdominal">Circ. Abdominal (cm)</Label>
                  <Input name="circ_abdominal" id="circ_abdominal" type="number" step="0.1" placeholder="85.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="circ_coxa">Circ. Coxa (cm)</Label>
                  <Input name="circ_coxa" id="circ_coxa" type="number" step="0.1" placeholder="55.0" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="circ_braco">Circ. Braco (cm)</Label>
                  <Input name="circ_braco" id="circ_braco" type="number" step="0.1" placeholder="33.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="circ_tornozelo">Circ. Tornozelo (cm)</Label>
                  <Input name="circ_tornozelo" id="circ_tornozelo" type="number" step="0.1" placeholder="22.0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gordura">% Gordura corporal (opcional)</Label>
                <Input name="gordura" id="gordura" type="number" step="0.1" placeholder="18.5" />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Registrar medidas"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Charts */}
        {measurements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Evolucao</CardTitle>
              <CardDescription>Acompanhe suas medidas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="data" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Peso" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Circ. Abdominal" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Circ. Braco" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Circ. Coxa" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History table */}
        {measurements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-4">Data</th>
                      <th className="pb-2 pr-4">Peso</th>
                      <th className="pb-2 pr-4">Altura</th>
                      <th className="pb-2 pr-4">Abdominal</th>
                      <th className="pb-2 pr-4">Coxa</th>
                      <th className="pb-2 pr-4">Braco</th>
                      <th className="pb-2 pr-4">Tornozelo</th>
                      <th className="pb-2 pr-4">Gordura</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...measurements].reverse().map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="py-2 pr-4">{formatarData(m.data)}</td>
                        <td className="py-2 pr-4">{m.peso_kg} kg</td>
                        <td className="py-2 pr-4">{m.altura_cm} cm</td>
                        <td className="py-2 pr-4">{m.circ_abdominal_cm ?? "-"}</td>
                        <td className="py-2 pr-4">{m.circ_coxa_cm ?? "-"}</td>
                        <td className="py-2 pr-4">{m.circ_braco_cm ?? "-"}</td>
                        <td className="py-2 pr-4">{m.circ_tornozelo_cm ?? "-"}</td>
                        <td className="py-2 pr-4">{m.gordura_percentual ? `${m.gordura_percentual}%` : "-"}</td>
                        <td className="py-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {measurements.length === 0 && !loadingData && (
          <Card>
            <CardContent className="py-8">
              <div className="flex h-24 items-center justify-center text-muted-foreground">
                Nenhuma medicao registrada ainda. Preencha o formulario acima.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
