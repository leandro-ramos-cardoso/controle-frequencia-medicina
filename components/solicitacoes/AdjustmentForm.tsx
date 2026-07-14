'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAttendanceAdjustment } from '@/lib/requests/actions';
import { ADJUSTMENT_REASONS } from '@/lib/validations/requests';

const RECORD_TYPES = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'inicio_intervalo', label: 'Início do intervalo' },
  { value: 'retorno_intervalo', label: 'Retorno do intervalo' },
];

export function AdjustmentForm({
  recentRecords,
}: {
  recentRecords: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await createAttendanceAdjustment(formData);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push('/aluno/solicitacoes');
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Registro relacionado (opcional)
        </label>
        <select
          name="attendanceRecordId"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        >
          <option value="">Nenhum registro específico</option>
          {recentRecords.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
          <input
            type="date"
            name="requestedDate"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Horário</label>
          <input
            type="time"
            name="requestedTime"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de registro</label>
        <select name="recordType" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          {RECORD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Motivo</label>
        <select name="reason" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          {ADJUSTMENT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          placeholder="Explique o que aconteceu"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Anexo comprobatório (opcional)</label>
        <input
          type="file"
          name="attachment"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="w-full text-sm"
        />
      </div>

      <p className="text-xs text-slate-400">
        Ao enviar, você confirma que esta solicitação será analisada pelo preceptor — o registro
        original não é alterado até a aprovação.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? 'Enviando...' : 'Enviar solicitação'}
      </button>
    </form>
  );
}
