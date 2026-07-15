import { formatTime } from '@/lib/format';

const SITUACAO_TEXT: Record<string, { label: string; className: string }> = {
  presente: { label: 'Presente', className: 'bg-emerald-50 text-emerald-700' },
  ausente: { label: 'Concluiu o dia', className: 'bg-slate-100 text-slate-600' },
  sem_registro_hoje: { label: 'Sem registro hoje', className: 'bg-amber-50 text-amber-700' },
};

export function StudentRow({
  fullName,
  registrationNumber,
  internshipName,
  situacao,
  lastRecordTime,
  distanceMeters,
}: {
  fullName: string;
  registrationNumber: string;
  internshipName: string;
  situacao: 'presente' | 'ausente' | 'sem_registro_hoje';
  lastRecordTime: string | null;
  distanceMeters: number | null;
}) {
  const status = SITUACAO_TEXT[situacao];

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {fullName
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{fullName}</p>
          <p className="truncate text-xs text-slate-400">
            {registrationNumber} · {internshipName}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
        {lastRecordTime && (
          <p className="mt-1 text-xs text-slate-400">
            {formatTime(lastRecordTime)}
            {distanceMeters !== null ? ` · ${distanceMeters}m` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
