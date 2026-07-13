import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { AppShell } from '@/components/ui/AppShell';
import { NAV_ITEMS } from '@/lib/navigation';
import { OfflineSyncManager } from '@/components/pwa/OfflineSyncManager';

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  // Defesa em profundidade: o middleware já bloqueia, isso confirma no server component.
  if (!profile || profile.role !== 'aluno') {
    redirect('/acesso-negado');
  }

  return (
    <AppShell items={NAV_ITEMS.aluno} userName={profile.full_name}>
      <OfflineSyncManager />
      {children}
    </AppShell>
  );
}
