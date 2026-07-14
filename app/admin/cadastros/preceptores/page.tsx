import { listPreceptors, listOptionsForForms } from '@/lib/queries/admin';
import { createPreceptor, deactivatePreceptor } from '@/lib/admin/actions';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function PreceptoresPage() {
  const [preceptors, { institutions }] = await Promise.all([listPreceptors(), listOptionsForForms()]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Preceptores</h1>

      <form action={async (formData: FormData) => { await createPreceptor(formData); }} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2">
        <select name="institutionId" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2">
          <option value="">Instituição *</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <input name="fullName" required placeholder="Nome completo *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <input name="crmNumber" required placeholder="CRM *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="crmState" required maxLength={2} placeholder="UF *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="specialty" placeholder="Especialidade" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="phone" placeholder="Telefone" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="E-mail" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white sm:col-span-2">
          Cadastrar preceptor
        </button>
      </form>

      <div className="space-y-2">
        {preceptors.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{p.full_name}</p>
              <p className="truncate text-xs text-slate-400">
                CRM {p.crm_number}/{p.crm_state} · {p.institutions?.name}
                {!p.active && ' · inativo'}
              </p>
            </div>
            <DeleteButton action={deactivatePreceptor.bind(null, p.id)} confirmMessage="Inativar este preceptor?" />
          </div>
        ))}
        {preceptors.length === 0 && <p className="text-sm text-slate-500">Nenhum preceptor cadastrado.</p>}
      </div>
    </div>
  );
}
