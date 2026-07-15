import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getStudentDashboardData } from '@/lib/queries/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { RegisterPointCta } from '@/components/dashboard/RegisterPointCta';
import { LastRecordCard } from '@/components/dashboard/LastRecordCard';

export default async function AlunoDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // layout já redireciona; guarda extra para o TypeScript

  const data = await getStudentDashboardData(profile.id);

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Não encontramos seu cadastro de aluno. Entre em contato com a coordenação.
      </div>
    );
  }

  const firstName = data.studentName.split(' ')[0];
  const frequencyPct =
    data.internship && data.internship.requiredHours > 0
      ? Math.min(Math.round((data.hoursCompleted / data.internship.requiredHours) * 100), 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Olá, {firstName}</h1>
        <p className="text-sm text-slate-500">
          {data.courseName}
          {data.className ? ` · ${data.className}` : ''} · {data.institutionName}
        </p>
      </div>

      {data.internship ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-sm font-medium text-slate-900">{data.internship.name}</p>
          <dl className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-500 sm:grid-cols-2">
            <div>
              <dt className="inline text-slate-400">Local: </dt>
              <dd className="inline">{data.internship.locationName ?? '—'}</dd>
            </div>
            <div>
              <dt className="inline text-slate-400">Preceptor: </dt>
              <dd className="inline">
                {data.internship.preceptorName ?? '—'}
                {data.internship.preceptorCrm ? ` (CRM ${data.internship.preceptorCrm})` : ''}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          Você ainda não está vinculado a nenhum estágio.
        </div>
      )}

      <RegisterPointCta action={data.nextAction} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Horas cumpridas" value={data.hoursCompleted} hint="h" />
        <StatCard label="Horas previstas" value={data.internship?.requiredHours ?? 0} hint="h" />
        <StatCard label="Frequência" value={`${frequencyPct}%`} />
        <StatCard label="Registros pendentes" value={data.pendingRecordsCount} />
        <StatCard label="Solicitações abertas" value={data.openRequestsCount} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Últimos registros</h2>
        {data.recentRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
            Nenhum registro encontrado ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentRecords.map((record) => (
              <LastRecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
