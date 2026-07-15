import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getPreceptorProfileData } from '@/lib/queries/profile';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-slate-700">{value ?? '—'}</span>
    </div>
  );
}

export default async function PerfilPreceptorPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const preceptor = await getPreceptorProfileData(profile.id);

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Perfil</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{profile.full_name}</p>
          <p className="text-xs text-slate-400">{profile.email}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <Row label="CRM" value={preceptor ? `${preceptor.crm_number}/${preceptor.crm_state}` : null} />
        <Row label="Especialidade" value={preceptor?.specialty} />
        <Row label="Telefone" value={preceptor?.phone} />
        <Row label="Instituição" value={preceptor?.institutions?.name} />
      </div>

      <p className="text-xs text-slate-400">
        Edição de dados cadastrais e troca de senha ainda não estão disponíveis nesta etapa.
      </p>
    </div>
  );
}
