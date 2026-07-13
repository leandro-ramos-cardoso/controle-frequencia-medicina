import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { AppShell } from '@/components/ui/AppShell';
import { NAV_ITEMS } from '@/lib/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'administrador') {
    redirect('/acesso-negado');
  }

  return (
    <AppShell items={NAV_ITEMS.administrador} userName={profile.full_name}>
      {children}
    </AppShell>
  );
}
