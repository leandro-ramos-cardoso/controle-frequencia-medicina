import { describe, it, expect } from 'vitest';
import { getNextAction, canTransitionTo } from '../next-action';
import type { AttendanceRecord } from '@/types/attendance';

function record(type: AttendanceRecord['record_type']): AttendanceRecord {
  return {
    id: '1',
    student_id: 's1',
    internship_id: 'i1',
    location_id: null,
    preceptor_id: null,
    record_type: type,
    recorded_at: new Date().toISOString(),
    server_recorded_at: new Date().toISOString(),
    distance_meters: null,
    accuracy_meters: null,
    location_status: null,
    validation_status: 'pendente',
    notes: null,
  };
}

describe('canTransitionTo', () => {
  it('permite entrada quando não há registro anterior', () => {
    expect(canTransitionTo(null, 'entrada')).toBe(true);
  });

  it('não permite duas entradas consecutivas', () => {
    expect(canTransitionTo('entrada', 'entrada')).toBe(false);
  });

  it('não permite saída sem entrada', () => {
    expect(canTransitionTo(null, 'saida')).toBe(false);
    expect(canTransitionTo('inicio_intervalo', 'saida')).toBe(false);
  });

  it('permite saída após entrada', () => {
    expect(canTransitionTo('entrada', 'saida')).toBe(true);
  });

  it('permite saída após retorno de intervalo', () => {
    expect(canTransitionTo('retorno_intervalo', 'saida')).toBe(true);
  });

  it('não permite retorno de intervalo sem início de intervalo', () => {
    expect(canTransitionTo('entrada', 'retorno_intervalo')).toBe(false);
  });

  it('permite retorno de intervalo após início de intervalo', () => {
    expect(canTransitionTo('inicio_intervalo', 'retorno_intervalo')).toBe(true);
  });

  it('permite entrada após saída (novo ciclo)', () => {
    expect(canTransitionTo('saida', 'entrada')).toBe(true);
  });
});

describe('getNextAction', () => {
  it('retorna "Fora do horário permitido" quando fora da janela, mesmo sem registro', () => {
    const action = getNextAction({ lastRecordToday: null, isWithinSchedule: false });
    expect(action.disabled).toBe(true);
    expect(action.label).toBe('Fora do horário permitido');
  });

  it('sugere "Registrar entrada" quando não há registro hoje', () => {
    const action = getNextAction({ lastRecordToday: null, isWithinSchedule: true });
    expect(action.recordType).toBe('entrada');
    expect(action.disabled).toBe(false);
  });

  it('sugere "Registrar saída" após entrada', () => {
    const action = getNextAction({ lastRecordToday: record('entrada'), isWithinSchedule: true });
    expect(action.recordType).toBe('saida');
  });

  it('sugere "Retornar do intervalo" após início de intervalo', () => {
    const action = getNextAction({ lastRecordToday: record('inicio_intervalo'), isWithinSchedule: true });
    expect(action.recordType).toBe('retorno_intervalo');
  });

  it('sugere "Registrar saída" após retorno de intervalo', () => {
    const action = getNextAction({ lastRecordToday: record('retorno_intervalo'), isWithinSchedule: true });
    expect(action.recordType).toBe('saida');
  });

  it('bloqueia novo registro após saída (ciclo do dia concluído)', () => {
    const action = getNextAction({ lastRecordToday: record('saida'), isWithinSchedule: true });
    expect(action.disabled).toBe(true);
    expect(action.label).toBe('Registro já realizado');
  });
});
