import { describe, it, expect } from 'vitest';
import { calculateCompletedHours } from '../hours';
import type { AttendanceRecord } from '@/types/attendance';

function record(
  type: AttendanceRecord['record_type'],
  isoTime: string,
  status: AttendanceRecord['validation_status'] = 'aprovado'
): AttendanceRecord {
  return {
    id: `${type}-${isoTime}`,
    student_id: 's1',
    internship_id: 'i1',
    location_id: null,
    preceptor_id: null,
    record_type: type,
    recorded_at: isoTime,
    server_recorded_at: isoTime,
    distance_meters: null,
    accuracy_meters: null,
    location_status: null,
    validation_status: status,
    notes: null,
  };
}

describe('calculateCompletedHours', () => {
  it('soma 8h para um dia simples de entrada às 08:00 e saída às 16:00', () => {
    const records = [
      record('entrada', '2026-07-13T08:00:00Z'),
      record('saida', '2026-07-13T16:00:00Z'),
    ];
    expect(calculateCompletedHours(records)).toBe(8);
  });

  it('desconta o intervalo de almoço do total', () => {
    const records = [
      record('entrada', '2026-07-13T08:00:00Z'),
      record('inicio_intervalo', '2026-07-13T12:00:00Z'),
      record('retorno_intervalo', '2026-07-13T13:00:00Z'),
      record('saida', '2026-07-13T17:00:00Z'),
    ];
    // 9h de entrada até saída, menos 1h de intervalo = 8h
    expect(calculateCompletedHours(records)).toBe(8);
  });

  it('ignora registros pendentes (só conta aprovados)', () => {
    const records = [
      record('entrada', '2026-07-13T08:00:00Z', 'pendente'),
      record('saida', '2026-07-13T16:00:00Z', 'pendente'),
    ];
    expect(calculateCompletedHours(records)).toBe(0);
  });

  it('soma múltiplos dias', () => {
    const records = [
      record('entrada', '2026-07-13T08:00:00Z'),
      record('saida', '2026-07-13T12:00:00Z'),
      record('entrada', '2026-07-14T08:00:00Z'),
      record('saida', '2026-07-14T12:00:00Z'),
    ];
    expect(calculateCompletedHours(records)).toBe(8);
  });

  it('ignora entrada sem saída correspondente (dia incompleto)', () => {
    const records = [record('entrada', '2026-07-13T08:00:00Z')];
    expect(calculateCompletedHours(records)).toBe(0);
  });
});
