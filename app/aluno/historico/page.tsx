import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getStudentHistory, groupRecordsByDay } from '@/lib/queries/history';
import { HistoryFiltersBar } from '@/components/historico/HistoryFiltersBar';
import { DaySummaryCard } from '@/components/historico/DaySummaryCard';
import type { RecordType, ValidationStatus } from '@/types/attendance';

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; status?: string; recordType?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const params = await searchParams;

  const records = await getStudentHistory(profile.id, {
    startDate: params.startDate,
    endDate: params.endDate,
    status: (params.status || undefined) as ValidationStatus | undefined,
    recordType: (params.recordType || undefined) as RecordType | undefined,
  });

  const days = groupRecordsByDay(records);
  const totalMinutes = days.reduce((sum, d) => sum + d.totalMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Histórico</h1>
        <p className="text-sm text-slate-500">
          {days.length} {days.length === 1 ? 'dia' : 'dias'} · total de {totalHours}h no período
        </p>
      </div>

      <HistoryFiltersBar />

      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Nenhum registro encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => (
            <DaySummaryCard key={day.date} day={day} />
          ))}
        </div>
      )}
    </div>
  );
}
