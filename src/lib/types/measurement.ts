export interface Measurement {
  id: string;
  user_id: string;
  data: string;
  peso_kg: number;
  altura_cm: number;
  circ_abdominal_cm: number | null;
  circ_coxa_cm: number | null;
  circ_braco_cm: number | null;
  circ_tornozelo_cm: number | null;
  gordura_percentual: number | null;
  created_at: string;
}
