import { getCurrentProfile } from '@/lib/auth/get-profile';
import {
  getPreceptorId,
  getPendingRecords,
  getPendingAdjustments,
  getPendingJustifications,
} from '@/lib/queries/preceptor-dashboard';
import { AprovacoesClient } from './AprovacoesClient';

export default async function AprovacoesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const preceptorId = await getPreceptorId(profile.id);
  if (!preceptorId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Cadastro de preceptor não encontrado.
      </div>
    );
  }

  const [records, adjustments, justifications] = await Promise.all([
    getPendingRecords(preceptorId),
    getPendingAdjustments(preceptorId),
    getPendingJustifications(preceptorId),
  ]);

  return (
    <AprovacoesClient
      initialRecords={records}
      initialAdjustments={adjustments}
      initialJustifications={justifications}
    />
  );
}
