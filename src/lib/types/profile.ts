export type Objetivo = "performance" | "emagrecimento" | "manutencao" | "clinico";
export type NivelAtividade = "sedentario" | "leve" | "moderado" | "intenso";
export type Sexo = "M" | "F";

export interface Profile {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: Sexo;
  objetivo: Objetivo;
  condicoes_clinicas: string[];
  restricoes_alimentares: string[];
  nivel_atividade: NivelAtividade;
  created_at: string;
  updated_at: string;
}
