'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

type ActionResult = { success: true } | { success: false; error: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
    >
      {pending ? 'Salvando…' : label}
    </button>
  );
}

export function CreateForm({
  action,
  submitLabel,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(async (_prevState, formData) => {
    const result = await action(formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, null);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {state && !state.success && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
