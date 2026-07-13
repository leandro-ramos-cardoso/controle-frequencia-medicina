import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getPreceptorId, getSupervisedStudents } from '@/lib/queries/preceptor-dashboard';
import { StudentRow } from '@/components/preceptor/StudentRow';

export default async function AlunosSupervisionadosPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const preceptorId = await getPreceptorId(profile.id);
  const students = preceptorId ? await getSupervisedStudents(preceptorId) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Alunos supervisionados</h1>

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
  );
}
