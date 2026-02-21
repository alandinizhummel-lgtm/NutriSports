"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function MedidasPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      toast.success("Medidas registradas com sucesso!");
      setLoading(false);
    }, 1000);
  }

  return (
    <>
      <Header
        title="Medidas Corporais"
        description="Registre suas medidas para acompanhar a evolucao"
      />
      <div className="flex-1 space-y-6 p-6">
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
                  <Input
                    id="peso_kg"
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura_cm">Altura (cm) *</Label>
                  <Input
                    id="altura_cm"
                    type="number"
                    step="0.1"
                    placeholder="175"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="circ_abdominal">Circ. Abdominal (cm)</Label>
                  <Input
                    id="circ_abdominal"
                    type="number"
                    step="0.1"
                    placeholder="85.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="circ_coxa">Circ. Coxa (cm)</Label>
                  <Input
                    id="circ_coxa"
                    type="number"
                    step="0.1"
                    placeholder="55.0"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="circ_braco">Circ. Braco (cm)</Label>
                  <Input
                    id="circ_braco"
                    type="number"
                    step="0.1"
                    placeholder="33.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="circ_tornozelo">Circ. Tornozelo (cm)</Label>
                  <Input
                    id="circ_tornozelo"
                    type="number"
                    step="0.1"
                    placeholder="22.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gordura">% Gordura corporal (opcional)</Label>
                <Input
                  id="gordura"
                  type="number"
                  step="0.1"
                  placeholder="18.5"
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Registrar medidas"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Historico de Evolucao</CardTitle>
            <CardDescription>
              Seus graficos de evolucao aparecerao aqui apos registrar medidas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              Nenhuma medicao registrada ainda
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
