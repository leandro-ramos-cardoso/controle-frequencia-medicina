import { createClient } from '@/lib/supabase/server';
import { calculateCompletedHours } from '@/lib/attendance/hours';
import type { AttendanceRecord } from '@/types/attendance';

export type FrequencyReportFilters = {
  internshipId?: string;
  startDate?: string;
  endDate?: string;
};

export type FrequencyReportRow = {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  courseName: string;
  internshipName: string;
  requiredHours: number;
  completedHours: number;
  frequencyPct: number;
  lateCount: number;
  absenceCount: number;
};

/**
 * Relatório de frequência (individual/por turma/por estágio, conforme os
 * filtros aplicados). Agregação feita em memória — adequado para o volume
 * esperado de um único curso/estágio; se crescer muito, mover para uma
 * função SQL/RPC no Supabase.
 */
export async function getFrequencyReport(filters: FrequencyReportFilters): Promise<FrequencyReportRow[]> {
  const supabase = await createClient();

  let linksQuery = supabase
    .from('internship_students')
    .select(
      `student_id, internship_id,
       students(registration_number, profiles(full_name), courses(name), required_hours),
       internships(name, required_hours)`
    );
  if (filters.internshipId) linksQuery = linksQuery.eq('internship_id', filters.internshipId);

  const { data: links } = await linksQuery;
  if (!links || links.length === 0) return [];

  const { data: justifications } = await supabase
    .from('absence_justifications')
    .select('student_id, status')
    .eq('status', 'aprovada');

  const absenceCountByStudent = new Map<string, number>();
  for (const j of justifications ?? []) {
    absenceCountByStudent.set(j.student_id, (absenceCountByStudent.get(j.student_id) ?? 0) + 1);
  }

  const rows: FrequencyReportRow[] = [];

  for (const link of links as any[]) {
    let recordsQuery = supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', link.student_id)
      .eq('internship_id', link.internship_id);

    if (filters.startDate) recordsQuery = recordsQuery.gte('server_recorded_at', `${filters.startDate}T00:00:00`);
    if (filters.endDate) recordsQuery = recordsQuery.lte('server_recorded_at', `${filters.endDate}T23:59:59`);

    const { data: records } = await recordsQuery;
    const typedRecords = (records ?? []) as AttendanceRecord[];

    const completedHours = calculateCompletedHours(typedRecords);
    const requiredHours = link.internships?.required_hours || link.students?.required_hours || 0;
    const lateCount = typedRecords.filter((r) => r.validation_status === 'fora_do_perimetro').length;

    rows.push({
      studentId: link.student_id,
      studentName: link.students?.profiles?.full_name ?? '',
      registrationNumber: link.students?.registration_number ?? '',
      courseName: link.students?.courses?.name ?? '',
      internshipName: link.internships?.name ?? '',
      requiredHours,
      completedHours,
      frequencyPct: requiredHours > 0 ? Math.round((completedHours / requiredHours) * 100) : 0,
      lateCount,
      absenceCount: absenceCountByStudent.get(link.student_id) ?? 0,
    });
  }

  return rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export type ChartPoint = { label: string; value: number };

/** Registros aprovados por dia, para o gráfico "frequência por período". */
export async function getRecordsByDayChart(filters: FrequencyReportFilters): Promise<ChartPoint[]> {
  const supabase = await createClient();

  let query = supabase
    .from('attendance_records')
    .select('server_recorded_at')
    .eq('validation_status', 'aprovado');
  if (filters.internshipId) query = query.eq('internship_id', filters.internshipId);
  if (filters.startDate) query = query.gte('server_recorded_at', `${filters.startDate}T00:00:00`);
  if (filters.endDate) query = query.lte('server_recorded_at', `${filters.endDate}T23:59:59`);

  const { data } = await query;
  const byDay = new Map<string, number>();
  for (const r of data ?? []) {
    const day = new Date(r.server_recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  return Array.from(byDay.entries()).map(([label, value]) => ({ label, value }));
}

/** Registros por local, para o gráfico "registros por local". */
export async function getRecordsByLocationChart(filters: FrequencyReportFilters): Promise<ChartPoint[]> {
  const supabase = await createClient();

  let query = supabase.from('attendance_records').select('location_id, internship_locations(name)');
  if (filters.internshipId) query = query.eq('internship_id', filters.internshipId);
  if (filters.startDate) query = query.gte('server_recorded_at', `${filters.startDate}T00:00:00`);
  if (filters.endDate) query = query.lte('server_recorded_at', `${filters.endDate}T23:59:59`);

  const { data } = await query;
  const byLocation = new Map<string, number>();
  for (const r of (data ?? []) as any[]) {
    const name = r.internship_locations?.name ?? 'Sem local';
    byLocation.set(name, (byLocation.get(name) ?? 0) + 1);
  }
  return Array.from(byLocation.entries()).map(([label, value]) => ({ label, value }));
}
