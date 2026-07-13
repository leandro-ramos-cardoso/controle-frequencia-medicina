import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getPreceptorId, getPreceptorStats, getSupervisedStudents } from '@/lib/queries/preceptor-dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { StudentRow } from '@/components/preceptor/StudentRow';

export default async function PreceptorDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const preceptorId = await getPreceptorId(profile.id);
  if (!preceptorId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Cadastro de preceptor não encontrado. Entre em contato com o administrador.
      </div>
    );
  }

  const [stats, students] = await Promise.all([
    getPreceptorStats(preceptorId),
    getSupervisedStudents(preceptorId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Painel do preceptor</h1>
        <Link href="/preceptor/aprovacoes" className="text-sm font-medium text-brand-700 hover:underline">
          Ver aprovações
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Alunos supervisionados" value={stats.supervisedCount} />
        <StatCard label="Presentes hoje" value={stats.presentToday} />
        <StatCard label="Pontos pendentes" value={stats.pendingRecords} />
        <StatCard label="Ajustes/justificativas" value={stats.pendingAdjustments + stats.pendingJustifications} />
      </div>

      {stats.outOfPerimeterToday > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          {stats.outOfPerimeterToday} registro(s) de hoje fora do perímetro permitido — revise em Aprovações.
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Alunos supervisionados</h2>
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum aluno vinculado a você ainda.</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <StudentRow
                key={s.studentId}
                fullName={s.fullName}
                registrationNumber={s.registrationNumber}
                internshipName={s.internshipName}
                situacao={s.situacao}
                lastRecordTime={s.lastRecordTime}
                distanceMeters={s.distanceMeters}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
