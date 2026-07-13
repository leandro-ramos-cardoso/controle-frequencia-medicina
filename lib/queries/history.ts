import { createClient } from '@/lib/supabase/server';
import type { AttendanceRecord, RecordType, ValidationStatus } from '@/types/attendance';

export type HistoryFilters = {
  startDate?: string; // yyyy-mm-dd
  endDate?: string;
  status?: ValidationStatus;
  recordType?: RecordType;
};

export async function getStudentHistory(profileId: string, filters: HistoryFilters) {
  const supabase = await createClient();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', profileId).single();
  if (!student) return [];

  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', student.id)
    .order('server_recorded_at', { ascending: false });

  if (filters.startDate) query = query.gte('server_recorded_at', `${filters.startDate}T00:00:00`);
  if (filters.endDate) query = query.lte('server_recorded_at', `${filters.endDate}T23:59:59`);
  if (filters.status) query = query.eq('validation_status', filters.status);
  if (filters.recordType) query = query.eq('record_type', filters.recordType);

  const { data } = await query.limit(200);
  return (data ?? []) as AttendanceRecord[];
}

export type DayGroup = {
  date: string; // yyyy-mm-dd
  records: AttendanceRecord[];
  totalMinutes: number;
};

/**
 * Agrupa registros por dia e soma o total de minutos trabalhados no dia
 * (pares entrada/saída, descontando intervalos), independente do status
 * — aqui é só para exibição do resumo diário no histórico.
 */
export function groupRecordsByDay(records: AttendanceRecord[]): DayGroup[] {
  const byDay = new Map<string, AttendanceRecord[]>();

  for (const record of records) {
    const day = new Date(record.server_recorded_at).toISOString().slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(record);
  }

  return Array.from(byDay.entries())
    .map(([date, dayRecords]) => {
      const sorted = [...dayRecords].sort(
        (a, b) => new Date(a.server_recorded_at).getTime() - new Date(b.server_recorded_at).getTime()
      );

      let totalMinutes = 0;
      let entradaAt: Date | null = null;
      let intervalStart: Date | null = null;
      let intervalMinutes = 0;

      for (const r of sorted) {
        const at = new Date(r.server_recorded_at);
        if (r.record_type === 'entrada') {
          entradaAt = at;
          intervalMinutes = 0;
        } else if (r.record_type === 'inicio_intervalo') {
          intervalStart = at;
        } else if (r.record_type === 'retorno_intervalo' && intervalStart) {
          intervalMinutes += (at.getTime() - intervalStart.getTime()) / 60000;
          intervalStart = null;
        } else if (r.record_type === 'saida' && entradaAt) {
          totalMinutes += Math.max((at.getTime() - entradaAt.getTime()) / 60000 - intervalMinutes, 0);
          entradaAt = null;
        }
      }

      return { date, records: sorted, totalMinutes: Math.round(totalMinutes) };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
