import { createClient } from '@/lib/supabase/server';

export async function getStudentProfileData(profileId: string): Promise<any> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('students')
    .select('registration_number, required_hours, status, courses(name), institutions(name)')
    .eq('profile_id', profileId)
    .single();
  return data;
}
