const STATUS_MAP: Record<string, { label: string; className: string }> = {
  enviada: { label: 'Enviada', className: 'bg-blue-50 text-blue-700' },
  em_analise: { label: 'Em análise', className: 'bg-amber-50 text-amber-700' },
  aprovada: { label: 'Aprovada', className: 'bg-emerald-50 text-emerald-700' },
  recusada: { label: 'Recusada', className: 'bg-red-50 text-red-700' },
  necessita_correcao: { label: 'Necessita correção', className: 'bg-orange-50 text-orange-700' },
};

export function RequestStatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${info.className}`}>{info.label}</span>
  );
}
