import { createClient } from '@/lib/supabase/server';
import { calculateCompletedHours } from '@/lib/attendance/hours';
import { getNextAction } from '@/lib/attendance/next-action';
import type { AttendanceRecord } from '@/types/attendance';

export type StudentDashboardData = {
  studentId: string;
  studentName: string;
  courseName: string;
  className: string | null;
  institutionName: string;
  internship: {
    id: string;
    name: string;
    requiredHours: number;
    locationName: string | null;
    preceptorName: string | null;
    preceptorCrm: string | null;
  } | null;
  hoursCompleted: number;
  hoursRemaining: number;
  lastRecord: AttendanceRecord | null;
  pendingRecordsCount: number;
  openRequestsCount: number;
  nextAction: ReturnType<typeof getNextAction>;
};

export async function getStudentDashboardData(profileId: string): Promise<StudentDashboardData | null> {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from('students')
    .select(
      `id, required_hours,
       profiles(full_name),
       courses(name),
       classes(name),
       institutions(name)`
    )
    .eq('profile_id', profileId)
    .single();

  if (!student) return null;
  const s = student as any;

  const { data: link } = await supabase
    .from('internship_students')
    .select(
      `internship_id,
       internships(id, name, required_hours),
       internship_locations(name),
       preceptors(full_name, crm_number, crm_state)`
    )
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const lk = link as any;

  const internshipId: string | null = lk?.internship_id ?? null;

  const { data: recordsData } = internshipId
    ? await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('internship_id', internshipId)
        .order('server_recorded_at', { ascending: false })
        .limit(50)
    : { data: [] as AttendanceRecord[] };

  const records = (recordsData ?? []) as AttendanceRecord[];

  const today = new Date().toDateString();
  const todaysRecords = records.filter((r) => new Date(r.server_recorded_at).toDateString() === today);
  const lastRecordToday = todaysRecords[0] ?? null;

  const { count: pendingRecordsCount } = internshipId
    ? await supabase
        .from('attendance_records')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', student.id)
        .eq('validation_status', 'pendente')
    : { count: 0 };

  const { count: pendingAdjustments } = await supabase
    .from('attendance_adjustments')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id)
    .in('status', ['enviada', 'em_analise']);

  const { count: pendingJustifications } = await supabase
    .from('absence_justifications')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id)
    .in('status', ['enviada', 'em_analise']);

  const requiredHours = lk?.internships?.required_hours ?? s.required_hours ?? 0;
  const hoursCompleted = calculateCompletedHours(records);

  // TODO (etapa 8): substituir por verificação real contra `schedules` do estágio.
  const isWithinSchedule = true;

  return {
    studentId: s.id,
    studentName: s.profiles?.full_name ?? '',
    courseName: s.courses?.name ?? '',
    className: s.classes?.name ?? null,
    institutionName: s.institutions?.name ?? '',
    internship: lk
      ? {
          id: lk.internship_id,
          name: lk.internships?.name ?? '',
          requiredHours,
          locationName: lk.internship_locations?.name ?? null,
          preceptorName: lk.preceptors?.full_name ?? null,
          preceptorCrm: lk.preceptors
            ? `${lk.preceptors.crm_number}/${lk.preceptors.crm_state}`
            : null,
        }
      : null,
    hoursCompleted,
    hoursRemaining: Math.max(requiredHours - hoursCompleted, 0),
    lastRecord: records[0] ?? null,
    pendingRecordsCount: pendingRecordsCount ?? 0,
    openRequestsCount: (pendingAdjustments ?? 0) + (pendingJustifications ?? 0),
    nextAction: getNextAction({ lastRecordToday, isWithinSchedule }),
  };
}
