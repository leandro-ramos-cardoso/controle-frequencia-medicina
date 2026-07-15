export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1 text-2xl font-semibold text-slate-900">
        {value}
        {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      </p>
    </div>
  );
}
