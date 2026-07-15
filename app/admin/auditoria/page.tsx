import { listAuditLogs } from '@/lib/queries/admin';
import { formatDateTime } from '@/lib/format';

const ACTION_LABELS: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  deactivate: 'Remoção/inativação',
  approve: 'Aprovação',
  reject: 'Recusa',
  'review:aprovada': 'Aprovação',
  'review:recusada': 'Recusa',
  'review:necessita_correcao': 'Pedido de correção',
};

const ENTITY_LABELS: Record<string, string> = {
  attendance_records: 'Registro de ponto',
  attendance_adjustments: 'Ajuste de ponto',
  absence_justifications: 'Justificativa de ausência',
  institutions: 'Instituição',
  internship_locations: 'Local de estágio',
  preceptors: 'Preceptor',
  students: 'Aluno',
  internships: 'Estágio',
  system_settings: 'Configuração do sistema',
};

export default async function AuditoriaPage() {
  const logs = await listAuditLogs();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Auditoria</h1>
      <p className="text-sm text-slate-500">Últimas 100 ações registradas no sistema.</p>

      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">
                {ACTION_LABELS[log.action] ?? log.action} — {ENTITY_LABELS[log.entity] ?? log.entity}
              </p>
              <span className="shrink-0 text-xs text-slate-400">{formatDateTime(log.created_at)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Por {log.profiles?.full_name ?? 'sistema'}
              {log.entity_id && <> · ID {log.entity_id}</>}
            </p>
          </div>
        ))}
        {logs.length === 0 && <p className="text-sm text-slate-500">Nenhuma ação registrada ainda.</p>}
      </div>
    </div>
  );
}
