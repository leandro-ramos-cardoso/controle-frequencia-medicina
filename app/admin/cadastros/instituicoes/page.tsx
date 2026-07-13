import { listInstitutions } from '@/lib/queries/admin';
import { createInstitution, deactivateInstitution } from '@/lib/admin/actions';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function InstituicoesPage() {
  const institutions = await listInstitutions();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Instituições</h1>

      <form action={createInstitution} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2">
        <input name="name" required placeholder="Nome *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <input name="cnpj" placeholder="CNPJ" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="responsibleName" placeholder="Responsável" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="phone" placeholder="Telefone" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="E-mail" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="address" placeholder="Endereço" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white sm:col-span-2">
          Cadastrar instituição
        </button>
      </form>

      <div className="space-y-2">
        {institutions.map((inst) => (
          <div key={inst.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div>
              <p className="text-sm font-medium text-slate-900">{inst.name}</p>
              <p className="text-xs text-slate-400">{inst.cnpj ?? 'sem CNPJ'} · {inst.responsible_name ?? '—'}</p>
            </div>
            <DeleteButton action={deactivateInstitution.bind(null, inst.id)} />
          </div>
        ))}
        {institutions.length === 0 && <p className="text-sm text-slate-500">Nenhuma instituição cadastrada.</p>}
      </div>
    </div>
  );
}
