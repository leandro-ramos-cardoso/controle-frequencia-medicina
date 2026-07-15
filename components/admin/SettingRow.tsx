'use client';

import { useFormState, useFormStatus } from 'react-dom';

type ActionResult = { success: true } | { success: false; error: string };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? 'Salvando…' : 'Salvar'}
    </button>
  );
}

export function SettingRow({
  settingKey,
  description,
  value,
  action,
}: {
  settingKey: string;
  description: string | null;
  value: unknown;
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(async (_prevState, formData) => {
    return action(formData);
  }, null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-sm font-medium text-slate-900">{settingKey}</p>
      {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      <form action={formAction} className="mt-2 flex gap-2">
        <input
          name="value"
          defaultValue={typeof value === 'string' ? value : JSON.stringify(value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <SaveButton />
      </form>
      {state && !state.success && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-1 text-sm text-emerald-600">Salvo.</p>}
    </div>
  );
}
