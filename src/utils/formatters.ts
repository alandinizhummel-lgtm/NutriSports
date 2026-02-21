import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatarData(data: string): string {
  return format(parseISO(data), "dd/MM/yyyy", { locale: ptBR });
}

export function formatarDataCompleta(data: string): string {
  return format(parseISO(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatarDiaSemana(dia: number): string {
  const dias = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
  return dias[dia] ?? "";
}

export function formatarKcal(valor: number): string {
  return `${valor.toLocaleString("pt-BR")} kcal`;
}

export function formatarPeso(valor: number): string {
  return `${valor.toFixed(1)} kg`;
}

export function formatarMedida(valor: number | null): string {
  if (valor === null) return "-";
  return `${valor.toFixed(1)} cm`;
}
