import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getStudentRequests } from '@/lib/queries/requests';
import { RequestStatusBadge } from '@/components/solicitacoes/RequestStatusBadge';

export default async function SolicitacoesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const requests = await getStudentRequests(profile.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Minhas solicitações</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/aluno/solicitacoes/ajuste"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700"
        >
          <Plus size={16} /> Ajuste de ponto
        </Link>
        <Link
          href="/aluno/solicitacoes/justificativa"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700"
        >
          <Plus size={16} /> Justificar ausência
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Você ainda não fez nenhuma solicitação.
        </div>
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => (
            <li
              key={`${r.kind}-${r.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{r.summary}</p>
                <p className="truncate text-xs text-slate-400">
                  {r.kind === 'ajuste' ? 'Ajuste de ponto' : 'Justificativa de ausência'} ·{' '}
                  {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className="shrink-0"><RequestStatusBadge status={r.status} /></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
