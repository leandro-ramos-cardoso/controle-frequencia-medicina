import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getPointRegistrationContext } from '@/lib/queries/point-registration';
import { getNextAction } from '@/lib/attendance/next-action';
import { RegistrarPontoClient } from './RegistrarPontoClient';

export default async function RegistrarPontoPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const context = await getPointRegistrationContext(profile.id);

  if (!context) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Você não está vinculado a nenhum estágio ativo no momento.
      </div>
    );
  }

  // TODO (próxima iteração): validar contra `schedules` do estágio/local.
  const isWithinSchedule = true;
  const nextAction = getNextAction({ lastRecordToday: context.lastRecordToday, isWithinSchedule });

  return <RegistrarPontoClient context={context} nextAction={nextAction} />;
}
