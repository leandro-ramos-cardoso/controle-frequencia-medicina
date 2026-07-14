'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'recusado', label: 'Recusado' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'ajustado', label: 'Ajustado' },
  { value: 'fora_do_perimetro', label: 'Fora do perímetro' },
  { value: 'incompleto', label: 'Incompleto' },
  { value: 'cancelado', label: 'Cancelado' },
];

export function HistoryFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
      <input
        type="date"
        aria-label="Data inicial"
        defaultValue={searchParams.get('startDate') ?? ''}
        onChange={(e) => updateParam('startDate', e.target.value)}
        className="min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
      />
      <input
        type="date"
        aria-label="Data final"
        defaultValue={searchParams.get('endDate') ?? ''}
        onChange={(e) => updateParam('endDate', e.target.value)}
        className="min-w-0 rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
      />
      <select
        aria-label="Status"
        defaultValue={searchParams.get('status') ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => router.push(pathname)}
        className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-medium text-slate-600"
      >
        Limpar filtros
      </button>
    </div>
  );
}
