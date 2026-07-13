import type { AttendanceRecord, RecordType } from '@/types/attendance';

export type NextAction = {
  recordType: RecordType;
  label: string;
  disabled: boolean;
  reason?: string;
};

/**
 * Determina o botão principal de "Registrar ponto" a partir do último
 * registro do dia e se o horário atual está dentro da janela permitida.
 *
 * Regras (docs/business-rules.md):
 * - não permite saída sem entrada
 * - não permite duas entradas consecutivas
 * - não permite retorno sem início de intervalo
 */
export function getNextAction(params: {
  lastRecordToday: AttendanceRecord | null;
  isWithinSchedule: boolean;
}): NextAction {
  const { lastRecordToday, isWithinSchedule } = params;

  if (!isWithinSchedule) {
    return {
      recordType: 'entrada',
      label: 'Fora do horário permitido',
      disabled: true,
      reason: 'O horário atual está fora da janela configurada para este estágio.',
    };
  }

  if (!lastRecordToday) {
    return { recordType: 'entrada', label: 'Registrar entrada', disabled: false };
  }

  switch (lastRecordToday.record_type) {
    case 'entrada':
    case 'retorno_intervalo':
      return { recordType: 'saida', label: 'Registrar saída', disabled: false };
    case 'inicio_intervalo':
      return { recordType: 'retorno_intervalo', label: 'Retornar do intervalo', disabled: false };
    case 'saida':
      return {
        recordType: 'entrada',
        label: 'Registro já realizado',
        disabled: true,
        reason: 'Você já concluiu o ciclo de ponto de hoje.',
      };
    default:
      return { recordType: 'entrada', label: 'Registrar entrada', disabled: false };
  }
}

/**
 * Valida se um novo registro pode suceder o último do dia (espelha a
 * validação que o backend também deve aplicar antes de gravar).
 */
export function canTransitionTo(lastType: RecordType | null, next: RecordType): boolean {
  if (next === 'entrada') return lastType === null || lastType === 'saida';
  if (next === 'saida') return lastType === 'entrada' || lastType === 'retorno_intervalo';
  if (next === 'inicio_intervalo') return lastType === 'entrada';
  if (next === 'retorno_intervalo') return lastType === 'inicio_intervalo';
  return true; // tipos extraordinários/manuais são liberados por regra própria, não por sequência
}
