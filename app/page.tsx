import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { ROLE_HOME } from '@/lib/auth/role-home';

export default async function RootPage() {
  const profile = await getCurrentProfile();
  redirect(profile ? (ROLE_HOME[profile.role] ?? '/login') : '/login');
}
