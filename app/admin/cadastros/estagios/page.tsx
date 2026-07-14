import { listInternships, listOptionsForForms } from '@/lib/queries/admin';
import { createInternship, deactivateInternship } from '@/lib/admin/actions';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function EstagiosPage() {
  const [internships, { institutions, courses }] = await Promise.all([listInternships(), listOptionsForForms()]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Estágios</h1>

      <form action={async (formData: FormData) => { await createInternship(formData); }} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2">
        <select name="institutionId" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Instituição *</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <select name="courseId" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Curso *</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="code" required placeholder="Código *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="name" required placeholder="Nome *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="startDate" type="date" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="endDate" type="date" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="requiredHours" type="number" defaultValue={0} placeholder="Carga horária" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Descrição" rows={2} className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white sm:col-span-2">
          Cadastrar estágio
        </button>
      </form>

      <div className="space-y-2">
        {internships.map((i) => (
          <div key={i.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{i.name} <span className="text-slate-400">({i.code})</span></p>
              <p className="truncate text-xs text-slate-400">
                {i.institutions?.name} · {i.courses?.name} ·{' '}
                {new Date(i.start_date).toLocaleDateString('pt-BR')} a {new Date(i.end_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <DeleteButton action={deactivateInternship.bind(null, i.id)} />
          </div>
        ))}
        {internships.length === 0 && <p className="text-sm text-slate-500">Nenhum estágio cadastrado.</p>}
      </div>
    </div>
  );
}
