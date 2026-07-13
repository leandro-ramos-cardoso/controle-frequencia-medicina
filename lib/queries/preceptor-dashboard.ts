import { createClient } from '@/lib/supabase/server';

export async function getPreceptorId(profileId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('preceptors').select('id').eq('profile_id', profileId).single();
  return data?.id ?? null;
}

export type SupervisedStudent = {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  internshipName: string;
  lastRecordType: string | null;
  lastRecordTime: string | null;
  distanceMeters: number | null;
  situacao: 'presente' | 'ausente' | 'sem_registro_hoje';
};

export async function getSupervisedStudents(preceptorId: string): Promise<SupervisedStudent[]> {
  const supabase = await createClient();

  const { data: links } = await supabase
    .from('internship_students')
    .select(`student_id, internships(name), students(registration_number, profiles(full_name))`)
    .eq('preceptor_id', preceptorId);

  if (!links || links.length === 0) return [];

  const today = new Date().toISOString().slice(0, 10);

  const results: SupervisedStudent[] = [];
  for (const link of links) {
    const { data: lastRecord } = await supabase
      .from('attendance_records')
      .select('record_type, server_recorded_at, distance_meters')
      .eq('student_id', link.student_id)
      .gte('server_recorded_at', `${today}T00:00:00`)
      .order('server_recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let situacao: SupervisedStudent['situacao'] = 'sem_registro_hoje';
    if (lastRecord) {
      situacao = lastRecord.record_type === 'saida' ? 'ausente' : 'presente';
    }

    results.push({
      studentId: link.student_id,
      fullName: link.students?.profiles?.full_name ?? '',
      registrationNumber: link.students?.registration_number ?? '',
      internshipName: link.internships?.name ?? '',
      lastRecordType: lastRecord?.record_type ?? null,
      lastRecordTime: lastRecord?.server_recorded_at ?? null,
      distanceMeters: lastRecord?.distance_meters ?? null,
      situacao,
    });
  }

  return results;
}

export type PreceptorStats = {
  supervisedCount: number;
  presentToday: number;
  absentToday: number;
  pendingRecords: number;
  pendingAdjustments: number;
  pendingJustifications: number;
  outOfPerimeterToday: number;
};

export async function getPreceptorStats(preceptorId: string): Promise<PreceptorStats> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const students = await getSupervisedStudents(preceptorId);
  const presentToday = students.filter((s) => s.situacao === 'presente').length;
  const absentToday = students.filter((s) => s.situacao !== 'presente').length;

  const { count: pendingRecords } = await supabase
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('preceptor_id', preceptorId)
    .eq('validation_status', 'pendente');

  const { count: pendingAdjustments } = await supabase
    .from('attendance_adjustments')
    .select('id', { count: 'exact', head: true })
    .eq('preceptor_id', preceptorId)
    .in('status', ['enviada', 'em_analise']);

  const { count: pendingJustifications } = await supabase
    .from('absence_justifications')
    .select('id', { count: 'exact', head: true })
    .eq('preceptor_id', preceptorId)
    .in('status', ['enviada', 'em_analise']);

  const { count: outOfPerimeterToday } = await supabase
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('preceptor_id', preceptorId)
    .eq('location_status', 'fora_do_raio')
    .gte('server_recorded_at', `${today}T00:00:00`);

  return {
    supervisedCount: students.length,
    presentToday,
    absentToday,
    pendingRecords: pendingRecords ?? 0,
    pendingAdjustments: pendingAdjustments ?? 0,
    pendingJustifications: pendingJustifications ?? 0,
    outOfPerimeterToday: outOfPerimeterToday ?? 0,
  };
}

export async function getPendingRecords(preceptorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('attendance_records')
    .select(`*, students(registration_number, profiles(full_name))`)
    .eq('preceptor_id', preceptorId)
    .eq('validation_status', 'pendente')
    .order('server_recorded_at', { ascending: true });
  return data ?? [];
}

export async function getPendingAdjustments(preceptorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('attendance_adjustments')
    .select(`*, students(registration_number, profiles(full_name))`)
    .eq('preceptor_id', preceptorId)
    .in('status', ['enviada', 'em_analise'])
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function getPendingJustifications(preceptorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('absence_justifications')
    .select(`*, students(registration_number, profiles(full_name))`)
    .eq('preceptor_id', preceptorId)
    .in('status', ['enviada', 'em_analise'])
    .order('created_at', { ascending: true });
  return data ?? [];
}
