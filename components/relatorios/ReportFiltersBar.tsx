'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function ReportFiltersBar({ internships }: { internships: { id: string; name: string }[] }) {
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
      <select
        aria-label="Estágio"
        defaultValue={searchParams.get('internshipId') ?? ''}
        onChange={(e) => updateParam('internshipId', e.target.value)}
        className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm sm:col-span-2"
      >
        <option value="">Todos os estágios</option>
        {internships.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
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
    </div>
  );
}
