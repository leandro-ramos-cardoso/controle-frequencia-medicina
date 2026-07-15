import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDateTime } from '@/lib/format';

export type RequestListItem = {
  id: string;
  kind: 'ajuste' | 'justificativa';
  status: string;
  createdAt: string;
  summary: string;
};

export async function getRecentRecordOptions(profileId: string) {
  const supabase = await createClient();
  const { data: student } = await supabase.from('students').select('id').eq('profile_id', profileId).single();
  if (!student) return [];

  const { data } = await supabase
    .from('attendance_records')
    .select('id, record_type, server_recorded_at')
    .eq('student_id', student.id)
    .order('server_recorded_at', { ascending: false })
    .limit(15);

  const TYPE_LABEL: Record<string, string> = {
    entrada: 'Entrada',
    saida: 'Saída',
    inicio_intervalo: 'Início do intervalo',
    retorno_intervalo: 'Retorno do intervalo',
  };

  return (data ?? []).map((r) => ({
    id: r.id,
    label: `${TYPE_LABEL[r.record_type] ?? r.record_type} — ${formatDateTime(r.server_recorded_at)}`,
  }));
}

export async function getStudentRequests(profileId: string): Promise<RequestListItem[]> {
  const supabase = await createClient();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', profileId).single();
  if (!student) return [];

  const [{ data: adjustments }, { data: justifications }] = await Promise.all([
    supabase
      .from('attendance_adjustments')
      .select('id, status, created_at, requested_date, record_type')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('absence_justifications')
      .select('id, status, created_at, absence_start, absence_end')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false }),
  ]);

  const items: RequestListItem[] = [
    ...(adjustments ?? []).map((a) => ({
      id: a.id,
      kind: 'ajuste' as const,
      status: a.status,
      createdAt: a.created_at,
      summary: `Ajuste de ponto — ${formatDate(a.requested_date)}`,
    })),
    ...(justifications ?? []).map((j) => ({
      id: j.id,
      kind: 'justificativa' as const,
      status: j.status,
      createdAt: j.created_at,
      summary: `Ausência — ${formatDate(j.absence_start)} a ${formatDate(j.absence_end)}`,
    })),
  ];

  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
