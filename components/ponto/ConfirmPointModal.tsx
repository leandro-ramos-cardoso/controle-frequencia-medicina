'use client';

const TYPE_LABEL: Record<string, string> = {
  entrada: 'entrada',
  saida: 'saída',
  inicio_intervalo: 'início de intervalo',
  retorno_intervalo: 'retorno de intervalo',
  entrada_extraordinaria: 'entrada extraordinária',
  saida_extraordinaria: 'saída extraordinária',
  atividade_externa: 'atividade externa',
  manual_autorizado: 'registro manual',
};

export function ConfirmPointModal({
  open,
  recordType,
  internshipName,
  preceptorName,
  distanceMeters,
  accuracyMeters,
  submitting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  recordType: string;
  internshipName: string;
  preceptorName: string | null;
  distanceMeters: number | null;
  accuracyMeters: number | null;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-base font-semibold text-slate-900">
          Confirmar registro de {TYPE_LABEL[recordType] ?? recordType}?
        </h2>

        <dl className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <dt className="text-slate-400">Estágio</dt>
            <dd>{internshipName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Preceptor</dt>
            <dd>{preceptorName ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Distância</dt>
            <dd>{distanceMeters !== null ? `${distanceMeters} m` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Precisão</dt>
            <dd>{accuracyMeters !== null ? `${accuracyMeters.toFixed(2)} m` : '—'}</dd>
          </div>
        </dl>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? 'Confirmando...' : 'Confirmar registro'}
          </button>
        </div>
      </div>
    </div>
  );
}
