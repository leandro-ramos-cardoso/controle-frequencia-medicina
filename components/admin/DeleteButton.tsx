'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export function DeleteButton({
  action,
  confirmMessage = 'Tem certeza? Esta ação pode ser revertida apenas pelo administrador via banco de dados.',
}: {
  action: () => Promise<{ success: boolean; error?: string }>;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!confirm(confirmMessage)) return;
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (!result.success && result.error) alert(result.error);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Remover"
    >
      <Trash2 size={16} />
    </button>
  );
}
