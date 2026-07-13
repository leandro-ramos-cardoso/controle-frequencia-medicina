import { listStudents, listOptionsForForms } from '@/lib/queries/admin';
import { createStudent, deactivateStudent } from '@/lib/admin/actions';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AlunosPage() {
  const [students, { institutions, courses }] = await Promise.all([listStudents(), listOptionsForForms()]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Alunos</h1>

      {courses.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Nenhum curso cadastrado ainda — a tela de cadastro de cursos ainda não existe nesta etapa.
          Insira cursos diretamente via SQL (tabela <code>courses</code>) antes de cadastrar alunos.
        </p>
      )}

      <form action={createStudent} className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2">
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
        <input name="fullName" required placeholder="Nome completo *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <input name="registrationNumber" required placeholder="Matrícula *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="E-mail *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="requiredHours" type="number" defaultValue={0} placeholder="Carga horária exigida" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white sm:col-span-2">
          Cadastrar aluno
        </button>
      </form>
      <p className="text-xs text-slate-400">
        O aluno é cadastrado sem acesso ao sistema ainda — o convite (criação de login) é um fluxo
        separado, não implementado nesta etapa.
      </p>

      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div>
              <p className="text-sm font-medium text-slate-900">{s.profiles?.full_name ?? `Matrícula ${s.registration_number}`}</p>
              <p className="text-xs text-slate-400">
                {s.registration_number} · {s.courses?.name} · {s.institutions?.name}
                {!s.profiles && ' · aguardando convite'}
              </p>
            </div>
            <DeleteButton action={deactivateStudent.bind(null, s.id)} />
          </div>
        ))}
        {students.length === 0 && <p className="text-sm text-slate-500">Nenhum aluno cadastrado.</p>}
      </div>
    </div>
  );
}
