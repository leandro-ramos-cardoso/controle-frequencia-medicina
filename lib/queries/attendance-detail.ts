import { createClient } from '@/lib/supabase/server';

export async function getAttendanceRecordDetail(recordId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('attendance_records')
    .select(
      `*,
       students(registration_number, profiles(full_name), courses(name), institutions(name)),
       internships(name),
       internship_locations(name),
       preceptors(full_name, crm_number, crm_state),
       approver:approved_by(full_name)`
    )
    .eq('id', recordId)
    .single();

  return data;
}
