import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { AppShell } from '@/components/ui/AppShell';
import { NAV_ITEMS } from '@/lib/navigation';

export default async function CoordenadorLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'coordenador') {
    redirect('/acesso-negado');
  }

  return (
    <AppShell items={NAV_ITEMS.coordenador} userName={profile.full_name}>
      {children}
    </AppShell>
  );
}
