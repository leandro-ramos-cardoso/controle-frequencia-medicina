'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAbsenceJustification } from '@/lib/requests/actions';

export function JustificationForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await createAbsenceJustification(formData);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push('/aluno/solicitacoes');
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium text-slate-700">Data inicial</label>
          <input
            type="date"
            name="absenceStart"
            required
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-sm font-medium text-slate-700">Data final</label>
          <input
            type="date"
            name="absenceEnd"
            required
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Motivo</label>
        <input
          type="text"
          name="reason"
          required
          maxLength={200}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          placeholder="Ex: atestado médico, problema de saúde na família..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Documento comprobatório (opcional)</label>
        <input
          type="file"
          name="attachment"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="w-full text-sm"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? 'Enviando...' : 'Enviar justificativa'}
      </button>
    </form>
  );
}
