import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { fileName, fileBase64, fileType } = await request.json();

    // Get user profile for TMB calculation
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: lastMeasurement } = await supabase
      .from("measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build the prompt
    const isImage = fileType.startsWith("image/");
    const mediaType = isImage ? fileType as "image/jpeg" | "image/png" | "image/gif" | "image/webp" : null;

    const systemPrompt = `Voce e um especialista em educacao fisica e nutricao esportiva.
Analise a planilha/imagem de treino enviada e extraia um plano semanal estruturado.

Para cada dia da semana (0=Domingo a 6=Sabado), identifique:
- grupo_muscular: qual grupo muscular principal (ex: "Peito e Triceps", "Costas e Biceps", "Perna", "Ombro")
- exercicios: lista de exercicios com nome, series e repeticoes
- gasto_estimado_kcal: estimativa de gasto calorico do treino
- duracao_min: duracao estimada em minutos
- intensidade: "leve", "moderada" ou "intensa"
- eh_descanso: true se for dia de descanso

${profile ? `Dados do paciente: sexo ${profile.sexo}, objetivo: ${profile.objetivo}, nivel atividade: ${profile.nivel_atividade}` : ""}
${lastMeasurement ? `Medidas: ${lastMeasurement.peso_kg}kg, ${lastMeasurement.altura_cm}cm` : ""}

Responda APENAS com JSON valido, sem markdown, neste formato:
{
  "nome_plano": "string",
  "dias": [
    {
      "dia_semana": 0,
      "grupo_muscular": "Descanso",
      "exercicios": [],
      "gasto_estimado_kcal": 0,
      "duracao_min": 0,
      "intensidade": "leve",
      "eh_descanso": true
    }
  ]
}`;

    const content: Anthropic.ContentBlockParam[] = [];

    if (isImage && mediaType) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: fileBase64 },
      });
      content.push({ type: "text", text: "Analise esta planilha de treino e extraia o plano semanal estruturado." });
    } else {
      // For PDF/Excel, decode and send as text
      const decoded = Buffer.from(fileBase64, "base64").toString("utf-8");
      content.push({
        type: "text",
        text: `Analise esta planilha de treino e extraia o plano semanal estruturado.\n\nConteudo do arquivo "${fileName}":\n\n${decoded.substring(0, 10000)}`,
      });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const responseText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("");

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json({ error: "IA retornou formato invalido" }, { status: 500 });
    }

    // Calculate TMB if we have profile + measurements
    let gastoBasal = null;
    if (profile?.sexo && profile?.data_nascimento && lastMeasurement) {
      const idade = Math.floor((Date.now() - new Date(profile.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const tmb = profile.sexo === "M"
        ? 10 * lastMeasurement.peso_kg + 6.25 * lastMeasurement.altura_cm - 5 * idade + 5
        : 10 * lastMeasurement.peso_kg + 6.25 * lastMeasurement.altura_cm - 5 * idade - 161;
      gastoBasal = Math.round(tmb);
    }

    // Save training plan
    const { data: plan, error: planError } = await supabase
      .from("training_plans")
      .insert({
        user_id: user.id,
        nome: parsed.nome_plano || fileName,
        dados_parseados: parsed.dias,
        gasto_basal_kcal: gastoBasal,
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    // Save training days
    const daysToInsert = (parsed.dias || []).map((d: any) => ({
      plan_id: plan.id,
      dia_semana: d.dia_semana,
      grupo_muscular: d.grupo_muscular || "",
      exercicios: d.exercicios || [],
      gasto_estimado_kcal: d.gasto_estimado_kcal || 0,
      duracao_min: d.duracao_min || 0,
      intensidade: d.intensidade || "moderada",
      eh_descanso: d.eh_descanso || false,
    }));

    await supabase.from("training_days").insert(daysToInsert);

    return NextResponse.json({ success: true, planId: plan.id });
  } catch (err: any) {
    console.error("Erro importar-treino:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
