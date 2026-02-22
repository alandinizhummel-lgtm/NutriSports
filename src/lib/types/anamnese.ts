export type NivelAnamnese = "basico" | "intermediario" | "ironman";

export interface Anamnese {
  id: string;
  user_id: string;
  nivel: NivelAnamnese;

  // === BASICO ===
  // Dados pessoais (ja no profile, mas reforcar aqui)
  objetivo_detalhado: string;
  historico_peso: string; // "sempre magro", "engordou recentemente", etc

  // Doencas e medicacoes
  doencas: string[]; // checkboxes
  outras_doencas: string;
  usa_medicacao: boolean;
  medicacoes: string;

  // Habitos alimentares
  refeicoes_por_dia: number;
  horario_primeira_refeicao: string;
  horario_ultima_refeicao: string;
  consumo_agua_litros: number;
  consome_alcool: string; // "nunca", "socialmente", "frequente"

  // Restricoes
  alergias_alimentares: string[];
  intolerancia_lactose: boolean;
  intolerancia_gluten: boolean;
  vegetariano_vegano: string; // "nenhum", "vegetariano", "vegano"

  // === INTERMEDIARIO (adicional) ===
  // Habitos detalhados
  suplementos: string[];
  usa_suplemento: boolean;
  horario_treino: string;
  come_antes_treino: boolean;
  come_apos_treino: boolean;
  horas_sono: number;
  qualidade_sono: string; // "boa", "regular", "ruim"
  nivel_estresse: string; // "baixo", "medio", "alto"
  funcionamento_intestinal: string; // "regular", "constipacao", "diarreia", "alternado"

  // Preferencias
  alimentos_que_gosta: string;
  alimentos_que_nao_gosta: string;
  cozinha_propria: boolean;
  tempo_preparo_refeicao: string; // "rapido", "medio", "sem_limite"
  orcamento_alimentacao: string; // "economico", "moderado", "sem_limite"

  // === IRONMAN (adicional) ===
  // Historico esportivo
  tempo_treino_anos: number;
  lesoes_anteriores: string;
  objetivo_competicao: string;
  frequencia_treino_semanal: number;
  tipo_periodizacao: string;

  // Composicao corporal detalhada
  ja_fez_bioimpedancia: boolean;
  percentual_gordura_conhecido: number | null;
  meta_percentual_gordura: number | null;

  // Dieta anterior
  ja_fez_dieta_antes: boolean;
  tipo_dieta_anterior: string;
  resultado_dieta_anterior: string;

  // Exames
  ultimo_exame_sangue: string; // data
  glicose_jejum: number | null;
  colesterol_total: number | null;
  triglicerideos: number | null;
  hemoglobina: number | null;

  created_at: string;
  updated_at: string;
}

// Lista de doencas para checkbox
export const DOENCAS_COMUNS = [
  "Diabetes tipo 1",
  "Diabetes tipo 2",
  "Pre-diabetes",
  "Hipertensao arterial",
  "Colesterol alto",
  "Triglicerideos alto",
  "Hipotireoidismo",
  "Hipertireoidismo",
  "Sindrome metabolica",
  "Esteatose hepatica (gordura no figado)",
  "Doenca renal",
  "Gastrite / Refluxo",
  "Sindrome do intestino irritavel",
  "Doenca celiaca",
  "Anemia",
  "Gota / Acido urico alto",
  "Artrite / Artrose",
  "Depressao / Ansiedade",
  "Apneia do sono",
  "Doenca cardiovascular",
];

export const ALERGIAS_COMUNS = [
  "Amendoim",
  "Castanhas",
  "Leite de vaca",
  "Ovos",
  "Soja",
  "Trigo / Gluten",
  "Frutos do mar",
  "Peixes",
  "Corantes artificiais",
];

export const SUPLEMENTOS_COMUNS = [
  "Whey Protein",
  "Creatina",
  "BCAA",
  "Glutamina",
  "Cafeina / Pre-treino",
  "Omega 3",
  "Vitamina D",
  "Multivitaminico",
  "Melatonina",
  "Colageno",
  "ZMA",
  "Beta-alanina",
];
