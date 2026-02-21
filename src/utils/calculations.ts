import type { Sexo, NivelAtividade } from "@/lib/types/profile";

/**
 * IMC (Indice de Massa Corporal)
 */
export function calcularIMC(peso_kg: number, altura_cm: number): number {
  const altura_m = altura_cm / 100;
  return Number((peso_kg / (altura_m * altura_m)).toFixed(1));
}

export function classificarIMC(imc: number): string {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau I";
  if (imc < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

/**
 * TMB - Taxa Metabolica Basal (Mifflin-St Jeor)
 * Mais precisa que Harris-Benedict para populacao geral
 */
export function calcularTMB(
  peso_kg: number,
  altura_cm: number,
  idade_anos: number,
  sexo: Sexo
): number {
  const base = 10 * peso_kg + 6.25 * altura_cm - 5 * idade_anos;
  return Math.round(sexo === "M" ? base + 5 : base - 161);
}

/**
 * TDEE - Gasto Energetico Total Diario
 * TMB * fator de atividade
 */
const FATORES_ATIVIDADE: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
};

export function calcularTDEE(tmb: number, nivel_atividade: NivelAtividade): number {
  return Math.round(tmb * FATORES_ATIVIDADE[nivel_atividade]);
}

/**
 * Calcula a idade a partir da data de nascimento
 */
export function calcularIdade(data_nascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(data_nascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}
