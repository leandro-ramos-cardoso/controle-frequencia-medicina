import { createClient } from '@/lib/supabase/server';
import type { AttendanceRecord } from '@/types/attendance';

export type PointRegistrationContext = {
  studentId: string;
  internshipId: string;
  internshipName: string;
  location: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    allowedRadiusMeters: number;
    warningRadiusMeters: number;
  } | null;
  preceptorId: string | null;
  preceptorName: string | null;
  preceptorCrm: string | null;
  lastRecordToday: AttendanceRecord | null;
};

export async function getPointRegistrationContext(
  profileId: string
): Promise<PointRegistrationContext | null> {
  const supabase = await createClient();

  const { data: student } = await supabase.from('students').select('id').eq('profile_id', profileId).single();
  if (!student) return null;

  const { data: link } = await supabase
    .from('internship_students')
    .select(
      `internship_id,
       internships(name),
       internship_locations(id, name, latitude, longitude, allowed_radius_meters, warning_radius_meters),
       preceptors(id, full_name, crm_number, crm_state)`
    )
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!link) return null;
  const lk = link as any;

  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', student.id)
    .eq('internship_id', lk.internship_id)
    .order('server_recorded_at', { ascending: false })
    .limit(10);

  const today = new Date().toDateString();
  const lastRecordToday =
    (records ?? []).find((r: AttendanceRecord) => new Date(r.server_recorded_at).toDateString() === today) ??
    null;

  return {
    studentId: student.id,
    internshipId: lk.internship_id,
    internshipName: lk.internships?.name ?? '',
    location: lk.internship_locations
      ? {
          id: lk.internship_locations.id,
          name: lk.internship_locations.name,
          latitude: lk.internship_locations.latitude,
          longitude: lk.internship_locations.longitude,
          allowedRadiusMeters: lk.internship_locations.allowed_radius_meters,
          warningRadiusMeters: lk.internship_locations.warning_radius_meters,
        }
      : null,
    preceptorId: lk.preceptors?.id ?? null,
    preceptorName: lk.preceptors?.full_name ?? null,
    preceptorCrm: lk.preceptors ? `${lk.preceptors.crm_number}/${lk.preceptors.crm_state}` : null,
    lastRecordToday,
  };
}
