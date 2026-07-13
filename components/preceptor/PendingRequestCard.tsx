'use client';

export function PendingRequestCard({
  studentName,
  registrationNumber,
  summary,
  reason,
  description,
  onApprove,
  onReject,
  onRequestCorrection,
  busy,
}: {
  studentName: string;
  registrationNumber: string;
  summary: string;
  reason: string;
  description: string | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestCorrection: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-sm font-medium text-slate-900">
        {studentName} · {summary}
      </p>
      <p className="text-xs text-slate-400">{registrationNumber}</p>
      <p className="mt-2 text-sm text-slate-600">Motivo: {reason}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={onApprove}
          disabled={busy}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          Aprovar
        </button>
        <button
          onClick={onRequestCorrection}
          disabled={busy}
          className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 disabled:opacity-50"
        >
          Pedir correção
        </button>
        <button
          onClick={onReject}
          disabled={busy}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
        >
          Recusar
        </button>
      </div>
    </div>
  );
}
