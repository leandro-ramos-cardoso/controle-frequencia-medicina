import { createClient } from '@/lib/supabase/server';

export async function getAdminStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: studentsCount },
    { count: preceptorsCount },
    { count: activeInternshipStudents },
    { count: recordsToday },
    { count: pendingRecords },
    { count: pendingAdjustments },
    { count: pendingJustifications },
    { count: outOfPerimeterToday },
  ] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('preceptors').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('internship_students').select('id', { count: 'exact', head: true }),
    supabase.from('attendance_records').select('id', { count: 'exact', head: true }).gte('server_recorded_at', `${today}T00:00:00`),
    supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('validation_status', 'pendente'),
    supabase.from('attendance_adjustments').select('id', { count: 'exact', head: true }).in('status', ['enviada', 'em_analise']),
    supabase.from('absence_justifications').select('id', { count: 'exact', head: true }).in('status', ['enviada', 'em_analise']),
    supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('location_status', 'fora_do_raio').gte('server_recorded_at', `${today}T00:00:00`),
  ]);

  return {
    studentsCount: studentsCount ?? 0,
    preceptorsCount: preceptorsCount ?? 0,
    activeInternshipStudents: activeInternshipStudents ?? 0,
    recordsToday: recordsToday ?? 0,
    pendingRecords: pendingRecords ?? 0,
    pendingRequests: (pendingAdjustments ?? 0) + (pendingJustifications ?? 0),
    outOfPerimeterToday: outOfPerimeterToday ?? 0,
  };
}

export async function listInstitutions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('institutions')
    .select('id, name, cnpj, responsible_name, phone')
    .is('deleted_at', null)
    .order('name');
  return data ?? [];
}

export async function listLocations(): Promise<any[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('internship_locations')
    .select('id, name, type, status, allowed_radius_meters, institutions(name)')
    .is('deleted_at', null)
    .order('name');
  return (data ?? []) as any[];
}

export async function listPreceptors(): Promise<any[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('preceptors')
    .select('id, full_name, crm_number, crm_state, specialty, active, institutions(name)')
    .is('deleted_at', null)
    .order('full_name');
  return (data ?? []) as any[];
}

export async function listStudents(): Promise<any[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('students')
    .select('id, registration_number, status, profiles(full_name), courses(name), institutions(name)')
    .is('deleted_at', null)
    .order('registration_number');
  return (data ?? []) as any[];
}

export async function listInternships(): Promise<any[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('internships')
    .select('id, code, name, start_date, end_date, required_hours, institutions(name), courses(name)')
    .is('deleted_at', null)
    .order('start_date', { ascending: false });
  return (data ?? []) as any[];
}

/** Usado para popular os <select> dos formulários de cadastro. */
export async function listOptionsForForms() {
  const supabase = await createClient();
  const [{ data: institutions }, { data: courses }, { data: locations }] = await Promise.all([
    supabase.from('institutions').select('id, name').is('deleted_at', null).order('name'),
    supabase.from('courses').select('id, name, institution_id').order('name'),
    supabase.from('internship_locations').select('id, name, institution_id').is('deleted_at', null).order('name'),
  ]);
  return {
    institutions: institutions ?? [],
    courses: courses ?? [],
    locations: locations ?? [],
  };
}
