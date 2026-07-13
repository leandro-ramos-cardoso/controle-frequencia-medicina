import type { AttendanceRecord } from '@/types/attendance';

/**
 * Calcula horas cumpridas somando os intervalos entrada->saída, descontando
 * início_intervalo->retorno_intervalo. Considera apenas registros aprovados
 * (registros pendentes não contam para a carga horária ainda).
 *
 * Simplificação assumida: os registros já vêm ordenados cronologicamente e
 * pertencem a um único aluno/estágio. Dias com sequência incompleta são
 * ignorados no total (ficam como "incompleto" para o aluno resolver).
 */
export function calculateCompletedHours(records: AttendanceRecord[]): number {
  const approved = records
    .filter((r) => r.validation_status === 'aprovado')
    .sort((a, b) => new Date(a.server_recorded_at).getTime() - new Date(b.server_recorded_at).getTime());

  let totalMinutes = 0;
  let entradaAt: Date | null = null;
  let intervalStart: Date | null = null;
  let intervalMinutes = 0;

  for (const record of approved) {
    const at = new Date(record.server_recorded_at);

    switch (record.record_type) {
      case 'entrada':
        entradaAt = at;
        intervalMinutes = 0;
        break;
      case 'inicio_intervalo':
        intervalStart = at;
        break;
      case 'retorno_intervalo':
        if (intervalStart) {
          intervalMinutes += (at.getTime() - intervalStart.getTime()) / 60000;
          intervalStart = null;
        }
        break;
      case 'saida':
        if (entradaAt) {
          const workedMinutes = (at.getTime() - entradaAt.getTime()) / 60000 - intervalMinutes;
          totalMinutes += Math.max(workedMinutes, 0);
          entradaAt = null;
        }
        break;
      default:
        break;
    }
  }

  return Math.round((totalMinutes / 60) * 100) / 100; // horas, 2 casas decimais
}
