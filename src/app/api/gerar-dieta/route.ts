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

    // Gather all user data
    const [profileRes, measurementRes, planRes, daysRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("measurements").select("*").eq("user_id", user.id).order("data", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("training_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("training_days").select("*").order("dia_semana", { ascending: true }),
    ]);

    const profile = profileRes.data;
    const measurement = measurementRes.data;
    const plan = planRes.data;

    if (!profile || !measurement) {
      return NextResponse.json({ error: "Complete seu perfil e registre suas medidas primeiro" }, { status: 400 });
    }

    // Filter training days for this plan
    const trainingDays = plan
      ? (daysRes.data || []).filter((d: any) => d.plan_id === plan.id)
      : [];

    // Calculate age, TMB, TDEE
    const idade = Math.floor((Date.now() - new Date(profile.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const tmb = profile.sexo === "M"
      ? 10 * measurement.peso_kg + 6.25 * measurement.altura_cm - 5 * idade + 5
      : 10 * measurement.peso_kg + 6.25 * measurement.altura_cm - 5 * idade - 161;

    const fatorAtividade: Record<string, number> = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 };
    const tdee = Math.round(tmb * (fatorAtividade[profile.nivel_atividade] || 1.55));

    const objetivoMap: Record<string, string> = {
      emagrecimento: `Deficit calorico de 300-500 kcal abaixo do TDEE (${tdee} kcal). Priorizar proteina alta (2g/kg) para preservar massa muscular.`,
      performance: `Superavit de 200-400 kcal acima do TDEE (${tdee} kcal). Alta proteina (2-2.5g/kg), carboidratos altos para energia.`,
      manutencao: `Manter calorias proximas ao TDEE (${tdee} kcal). Distribuicao equilibrada de macros.`,
      clinico: `Adequar calorias ao TDEE (${tdee} kcal) considerando condicoes clinicas: ${(profile.condicoes_clinicas || []).join(", ") || "nenhuma especificada"}. Priorizar alimentos anti-inflamatorios.`,
    };

    const prompt = `Voce e um nutricionista esportivo brasileiro especializado.

## DADOS DO PACIENTE
- Nome: ${profile.nome}
- Idade: ${idade} anos, Sexo: ${profile.sexo === "M" ? "Masculino" : "Feminino"}
- Peso: ${measurement.peso_kg}kg, Altura: ${measurement.altura_cm}cm
- IMC: ${(measurement.peso_kg / Math.pow(measurement.altura_cm / 100, 2)).toFixed(1)}
- TMB (Mifflin-St Jeor): ${Math.round(tmb)} kcal
- TDEE: ${tdee} kcal
- Objetivo: ${profile.objetivo} - ${objetivoMap[profile.objetivo] || ""}
- Restricoes alimentares: ${(profile.restricoes_alimentares || []).join(", ") || "nenhuma"}
- Condicoes clinicas: ${(profile.condicoes_clinicas || []).join(", ") || "nenhuma"}

## PLANO DE TREINO SEMANAL
${trainingDays.map((d: any) => {
  if (d.eh_descanso) return `Dia ${d.dia_semana} (${["Dom","Seg","Ter","Qua","Qui","Sex","Sab"][d.dia_semana]}): DESCANSO`;
  return `Dia ${d.dia_semana} (${["Dom","Seg","Ter","Qua","Qui","Sex","Sab"][d.dia_semana]}): ${d.grupo_muscular} - ${d.duracao_min}min - ${d.intensidade} - ~${d.gasto_estimado_kcal}kcal`;
}).join("\n") || "Nenhum plano de treino definido"}

## INSTRUCOES
Gere uma dieta semanal completa com 2 variantes para cada dia:
1. **dieta_treino**: para quando o paciente TREINA naquele dia (calorias maiores, mais carbo)
2. **dieta_descanso**: para quando o paciente NAO TREINA (menos carbo, mantem proteina)

Cada dia deve ter refeicoes: cafe_da_manha, lanche_manha, almoco, lanche_tarde, jantar. Em dias de treino, adicionar pre_treino e pos_treino.

Use alimentos acessiveis no Brasil. Seja pratico e realista.

Responda APENAS com JSON valido (sem markdown) neste formato:
{
  "dieta_treino": [
    {
      "dia_semana": 1,
      "refeicoes": [
        {
          "tipo": "cafe_da_manha",
          "nome_display": "Cafe da Manha",
          "alimentos": [
            {"nome": "Ovos mexidos", "quantidade": "3 unidades", "calorias": 210, "proteina_g": 18, "carboidrato_g": 2, "gordura_g": 15}
          ],
          "calorias_total": 400
        }
      ],
      "calorias_total": 2500,
      "proteina_total_g": 180,
      "carboidrato_total_g": 280,
      "gordura_total_g": 80
    }
  ],
  "dieta_descanso": [same format],
  "calorias_treino": 2500,
  "calorias_descanso": 2100
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("");

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json({ error: "IA retornou formato invalido" }, { status: 500 });
    }

    // Get monday of current week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const semanaInicio = monday.toISOString().split("T")[0];

    const { error: dietError } = await supabase.from("diet_plans").insert({
      user_id: user.id,
      semana_inicio: semanaInicio,
      dieta_treino: parsed.dieta_treino || [],
      dieta_descanso: parsed.dieta_descanso || [],
      calorias_treino: parsed.calorias_treino || 0,
      calorias_descanso: parsed.calorias_descanso || 0,
      prompt_usado: prompt.substring(0, 5000),
    });

    if (dietError) {
      return NextResponse.json({ error: dietError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, diet: parsed });
  } catch (err: any) {
    console.error("Erro gerar-dieta:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
