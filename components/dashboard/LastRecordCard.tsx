import type { AttendanceRecord } from '@/types/attendance';

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

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-amber-50 text-amber-700' },
  aprovado: { label: 'Aprovado', className: 'bg-emerald-50 text-emerald-700' },
  recusado: { label: 'Recusado', className: 'bg-red-50 text-red-700' },
  em_analise: { label: 'Em análise', className: 'bg-blue-50 text-blue-700' },
  ajustado: { label: 'Ajustado', className: 'bg-violet-50 text-violet-700' },
  fora_do_perimetro: { label: 'Fora do perímetro', className: 'bg-orange-50 text-orange-700' },
  incompleto: { label: 'Incompleto', className: 'bg-slate-100 text-slate-600' },
  cancelado: { label: 'Cancelado', className: 'bg-slate-100 text-slate-500' },
};

export function LastRecordCard({ record }: { record: AttendanceRecord | null }) {
  if (!record) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
        Nenhum registro encontrado ainda.
      </div>
    );
  }

  const status = STATUS_LABEL[record.validation_status];
  const time = new Date(record.server_recorded_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = new Date(record.server_recorded_at).toLocaleDateString('pt-BR');

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{TYPE_LABEL[record.record_type]}</p>
        <p className="text-xs text-slate-500">
          {date} às {time}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
        {status.label}
      </span>
    </div>
  );
}
