export interface Exercicio {
  nome: string;
  series: number;
  repeticoes: string;
  carga_kg?: number;
}

export interface TrainingDay {
  id: string;
  plan_id: string;
  dia_semana: number;
  grupo_muscular: string;
  exercicios: Exercicio[];
  gasto_estimado_kcal: number;
  duracao_min: number;
  intensidade: "leve" | "moderada" | "intensa";
  eh_descanso: boolean;
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  nome: string;
  arquivo_original_url: string | null;
  dados_parseados: TrainingDay[];
  gasto_basal_kcal: number;
  gasto_total_estimado: Record<number, number>;
  created_at: string;
}

export interface TrainingLog {
  id: string;
  user_id: string;
  data: string;
  treinou: boolean;
  training_plan_id: string;
  notas: string | null;
}
