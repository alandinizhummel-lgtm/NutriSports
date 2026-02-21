export interface Alimento {
  nome: string;
  quantidade: string;
  calorias: number;
  proteina_g: number;
  carboidrato_g: number;
  gordura_g: number;
}

export interface Refeicao {
  tipo: "cafe_da_manha" | "lanche_manha" | "almoco" | "lanche_tarde" | "pre_treino" | "pos_treino" | "jantar" | "ceia";
  nome_display: string;
  alimentos: Alimento[];
  calorias_total: number;
}

export interface DietaDia {
  dia_semana: number;
  refeicoes: Refeicao[];
  calorias_total: number;
  proteina_total_g: number;
  carboidrato_total_g: number;
  gordura_total_g: number;
}

export interface DietPlan {
  id: string;
  user_id: string;
  semana_inicio: string;
  dieta_treino: DietaDia[];
  dieta_descanso: DietaDia[];
  calorias_treino: number;
  calorias_descanso: number;
  prompt_usado: string;
  created_at: string;
}
