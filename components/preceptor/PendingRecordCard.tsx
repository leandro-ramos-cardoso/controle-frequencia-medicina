'use client';

const TYPE_LABEL: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  inicio_intervalo: 'Início do intervalo',
  retorno_intervalo: 'Retorno do intervalo',
  entrada_extraordinaria: 'Entrada extraordinária',
  saida_extraordinaria: 'Saída extraordinária',
  atividade_externa: 'Atividade externa',
  manual_autorizado: 'Registro manual',
};

export function PendingRecordCard({
  record,
  selected,
  onToggleSelect,
  onApprove,
  onReject,
  busy,
}: {
  record: {
    id: string;
    record_type: string;
    server_recorded_at: string;
    distance_meters: number | null;
    location_status: string | null;
    students?: { registration_number: string; profiles?: { full_name: string } };
  };
  selected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        className="mt-1 h-4 w-4 rounded border-slate-300"
        aria-label="Selecionar para aprovação em lote"
      />

      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">
          {record.students?.profiles?.full_name} · {TYPE_LABEL[record.record_type]}
        </p>
        <p className="text-xs text-slate-400">
          {record.students?.registration_number} ·{' '}
          {new Date(record.server_recorded_at).toLocaleString('pt-BR')}
          {record.distance_meters !== null ? ` · ${record.distance_meters}m` : ''}
        </p>
        {record.location_status === 'fora_do_raio' && (
          <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
            Fora do perímetro
          </span>
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={onApprove}
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            Aprovar
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
    </div>
  );
}
