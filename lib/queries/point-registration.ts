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

  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', student.id)
    .eq('internship_id', link.internship_id)
    .order('server_recorded_at', { ascending: false })
    .limit(10);

  const today = new Date().toDateString();
  const lastRecordToday =
    (records ?? []).find((r: AttendanceRecord) => new Date(r.server_recorded_at).toDateString() === today) ??
    null;

  return {
    studentId: student.id,
    internshipId: link.internship_id,
    internshipName: link.internships?.name ?? '',
    location: link.internship_locations
      ? {
          id: link.internship_locations.id,
          name: link.internship_locations.name,
          latitude: link.internship_locations.latitude,
          longitude: link.internship_locations.longitude,
          allowedRadiusMeters: link.internship_locations.allowed_radius_meters,
          warningRadiusMeters: link.internship_locations.warning_radius_meters,
        }
      : null,
    preceptorId: link.preceptors?.id ?? null,
    preceptorName: link.preceptors?.full_name ?? null,
    preceptorCrm: link.preceptors ? `${link.preceptors.crm_number}/${link.preceptors.crm_state}` : null,
    lastRecordToday,
  };
}
