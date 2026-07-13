import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getRecentRecordOptions } from '@/lib/queries/requests';
import { AdjustmentForm } from '@/components/solicitacoes/AdjustmentForm';

export default async function SolicitarAjustePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const recentRecords = await getRecentRecordOptions(profile.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Solicitar ajuste de ponto</h1>
        <p className="text-sm text-slate-500">
          Seu registro original não é alterado — esta solicitação será analisada pelo preceptor.
        </p>
      </div>

      <AdjustmentForm recentRecords={recentRecords} />
    </div>
  );
}
