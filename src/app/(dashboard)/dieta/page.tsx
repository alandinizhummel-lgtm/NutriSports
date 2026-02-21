"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Zap } from "lucide-react";
import { useState } from "react";

const DIAS_SEMANA = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo",
];

export default function DietaPage() {
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [hasDiet] = useState(false);

  return (
    <>
      <Header
        title="Dieta Semanal"
        description="Sua dieta personalizada baseada no treino"
      />
      <div className="flex-1 space-y-6 p-6">
        {!hasDiet ? (
          /* Empty state */
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Gerar Dieta com IA</CardTitle>
              <CardDescription>
                Para gerar sua dieta personalizada, voce precisa ter completado:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">1</Badge>
                  <span className="text-sm">Perfil preenchido com objetivo definido</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">2</Badge>
                  <span className="text-sm">Pelo menos uma medicao corporal registrada</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">3</Badge>
                  <span className="text-sm">Plano de treino importado</span>
                </div>
              </div>
              <Button disabled className="mt-4">
                <Zap className="mr-2 h-4 w-4" />
                Gerar dieta com IA
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Diet display */
          <>
            {/* Day selector */}
            <Tabs
              value={String(diaSelecionado)}
              onValueChange={(v) => setDiaSelecionado(Number(v))}
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                {DIAS_SEMANA.map((dia, i) => (
                  <TabsTrigger key={dia} value={String(i)} className="min-w-[90px]">
                    {dia}
                  </TabsTrigger>
                ))}
              </TabsList>

              {DIAS_SEMANA.map((dia, i) => (
                <TabsContent key={dia} value={String(i)} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{dia}</CardTitle>
                          <CardDescription>
                            Dieta para dia de treino
                          </CardDescription>
                        </div>
                        <Badge>Treino</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          "Cafe da manha",
                          "Lanche da manha",
                          "Almoco",
                          "Lanche da tarde",
                          "Jantar",
                        ].map((refeicao) => (
                          <div
                            key={refeicao}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-primary" />
                              <span className="font-medium">{refeicao}</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Dieta sera exibida aqui apos geracao pela IA
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </>
  );
}
