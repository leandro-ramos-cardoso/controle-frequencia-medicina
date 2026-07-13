import Link from 'next/link';
import { Fingerprint } from 'lucide-react';
import type { NextAction } from '@/lib/attendance/next-action';

export function RegisterPointCta({ action }: { action: NextAction }) {
  if (action.disabled) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="text-sm font-medium text-slate-600">{action.label}</p>
        {action.reason && <p className="mt-1 text-xs text-slate-400">{action.reason}</p>}
      </div>
    );
  }

  return (
    <Link
      href="/aluno/registrar-ponto"
      className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-4 text-base font-semibold text-white shadow-card transition hover:bg-brand-700"
    >
      <Fingerprint size={22} />
      {action.label}
    </Link>
  );
}
