'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveAttendanceRecord,
  rejectAttendanceRecord,
  bulkApproveRecords,
  reviewAdjustment,
  reviewJustification,
} from '@/lib/preceptor/actions';
import { PendingRecordCard } from '@/components/preceptor/PendingRecordCard';
import { PendingRequestCard } from '@/components/preceptor/PendingRequestCard';
import { RejectModal } from '@/components/preceptor/RejectModal';
import { formatDate } from '@/lib/format';

type Tab = 'pontos' | 'ajustes' | 'justificativas';

type RejectTarget =
  | { kind: 'record'; id: string }
  | { kind: 'adjustment'; id: string; nextStatus: 'recusada' | 'necessita_correcao' }
  | { kind: 'justification'; id: string; nextStatus: 'recusada' | 'necessita_correcao' };

export function AprovacoesClient({
  initialRecords,
  initialAdjustments,
  initialJustifications,
}: {
  initialRecords: any[];
  initialAdjustments: any[];
  initialJustifications: any[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pontos');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleApproveRecord(id: string) {
    setBusyId(id);
    await approveAttendanceRecord(id);
    setBusyId(null);
    router.refresh();
  }

  async function handleBulkApprove() {
    setBusyId('bulk');
    await bulkApproveRecords(Array.from(selected));
    setSelected(new Set());
    setBusyId(null);
    router.refresh();
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return;
    setRejectSubmitting(true);

    if (rejectTarget.kind === 'record') {
      await rejectAttendanceRecord(rejectTarget.id, reason);
    } else if (rejectTarget.kind === 'adjustment') {
      await reviewAdjustment(rejectTarget.id, rejectTarget.nextStatus, reason);
    } else {
      await reviewJustification(rejectTarget.id, rejectTarget.nextStatus, reason);
    }

    setRejectSubmitting(false);
    setRejectTarget(null);
    router.refresh();
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pontos', label: 'Pontos', count: initialRecords.length },
    { key: 'ajustes', label: 'Ajustes', count: initialAdjustments.length },
    { key: 'justificativas', label: 'Justificativas', count: initialJustifications.length },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Aprovações</h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === 'pontos' && (
        <div className="space-y-3">
          {selected.size > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={busyId === 'bulk'}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Aprovar {selected.size} selecionado(s)
            </button>
          )}

          {initialRecords.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum registro pendente.</p>
          ) : (
            initialRecords.map((record) => (
              <PendingRecordCard
                key={record.id}
                record={record}
                selected={selected.has(record.id)}
                onToggleSelect={() => toggleSelect(record.id)}
                onApprove={() => handleApproveRecord(record.id)}
                onReject={() => setRejectTarget({ kind: 'record', id: record.id })}
                busy={busyId === record.id}
              />
            ))
          )}
        </div>
      )}

      {tab === 'ajustes' && (
        <div className="space-y-3">
          {initialAdjustments.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum ajuste pendente.</p>
          ) : (
            initialAdjustments.map((adj) => (
              <PendingRequestCard
                key={adj.id}
                studentName={adj.students?.profiles?.full_name ?? ''}
                registrationNumber={adj.students?.registration_number ?? ''}
                summary={`Ajuste — ${formatDate(adj.requested_date)}`}
                reason={adj.reason}
                description={adj.description}
                busy={busyId === adj.id}
                onApprove={async () => {
                  setBusyId(adj.id);
                  await reviewAdjustment(adj.id, 'aprovada');
                  setBusyId(null);
                  router.refresh();
                }}
                onRequestCorrection={() => setRejectTarget({ kind: 'adjustment', id: adj.id, nextStatus: 'necessita_correcao' })}
                onReject={() => setRejectTarget({ kind: 'adjustment', id: adj.id, nextStatus: 'recusada' })}
              />
            ))
          )}
        </div>
      )}

      {tab === 'justificativas' && (
        <div className="space-y-3">
          {initialJustifications.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma justificativa pendente.</p>
          ) : (
            initialJustifications.map((j) => (
              <PendingRequestCard
                key={j.id}
                studentName={j.students?.profiles?.full_name ?? ''}
                registrationNumber={j.students?.registration_number ?? ''}
                summary={`Ausência — ${formatDate(j.absence_start)} a ${formatDate(j.absence_end)}`}
                reason={j.reason}
                description={j.description}
                busy={busyId === j.id}
                onApprove={async () => {
                  setBusyId(j.id);
                  await reviewJustification(j.id, 'aprovada');
                  setBusyId(null);
                  router.refresh();
                }}
                onRequestCorrection={() => setRejectTarget({ kind: 'justification', id: j.id, nextStatus: 'necessita_correcao' })}
                onReject={() => setRejectTarget({ kind: 'justification', id: j.id, nextStatus: 'recusada' })}
              />
            ))
          )}
        </div>
      )}

      <RejectModal
        open={rejectTarget !== null}
        title={
          rejectTarget?.kind === 'record'
            ? 'Recusar registro de ponto'
            : rejectTarget && 'nextStatus' in rejectTarget && rejectTarget.nextStatus === 'necessita_correcao'
              ? 'Pedir correção'
              : 'Recusar solicitação'
        }
        confirmLabel={
          rejectTarget && 'nextStatus' in rejectTarget && rejectTarget.nextStatus === 'necessita_correcao'
            ? 'Pedir correção'
            : 'Recusar'
        }
        submitting={rejectSubmitting}
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </div>
  );
}
