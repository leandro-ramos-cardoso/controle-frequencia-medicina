'use client';

import { useState } from 'react';

export function RejectModal({
  open,
  title,
  confirmLabel = 'Confirmar',
  submitting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  confirmLabel?: string;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Descreva o motivo (obrigatório)"
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={submitting || !reason.trim()}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
