"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function TreinoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    // TODO: Upload to Supabase Storage + call /api/importar-treino
    setTimeout(() => {
      toast.success("Planilha importada! A IA esta analisando seu treino...");
      setLoading(false);
    }, 2000);
  }

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
                <p className="font-medium">
                  Clique para selecionar um arquivo
                </p>
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
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button onClick={handleUpload} disabled={loading} size="sm">
                  {loading ? "Processando..." : "Importar"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Plan placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Plano Semanal</CardTitle>
            <CardDescription>
              Seu plano de treino aparecera aqui apos importar a planilha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"].map(
                (dia) => (
                  <div
                    key={dia}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-muted-foreground"
                  >
                    <span className="text-sm font-medium">{dia}</span>
                    <span className="text-xs">Sem treino definido</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Log */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Registro de Hoje</CardTitle>
            <CardDescription>
              Marque se voce treinou hoje. Isso ajusta automaticamente sua dieta.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="default" className="flex-1">
              Treinei hoje
            </Button>
            <Button variant="outline" className="flex-1">
              Nao treinei
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
