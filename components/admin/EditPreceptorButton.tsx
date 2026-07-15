'use client';

import { useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Pencil, X } from 'lucide-react';

type ActionResult = { success: true } | { success: false; error: string };

type Preceptor = {
  id: string;
  full_name: string;
  crm_number: string;
  crm_state: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  institution_id: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
    >
      {pending ? 'Salvando…' : 'Salvar alterações'}
    </button>
  );
}

// Componente à parte, remontado (via `key`) toda vez que o modal abre, para
// que o useFormState comece limpo — sem isso, um erro de uma tentativa
// anterior ficava visível ao reabrir o modal antes de qualquer novo envio.
function EditPreceptorModal({
  preceptor,
  institutions,
  action,
  onClose,
}: {
  preceptor: Preceptor;
  institutions: { id: string; name: string }[];
  action: (formData: FormData) => Promise<ActionResult>;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<ActionResult | null, FormData>(async (_prevState, formData) => {
    const result = await action(formData);
    if (result.success) onClose();
    return result;
  }, null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Editar preceptor</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            name="institutionId"
            required
            defaultValue={preceptor.institution_id}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          >
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <input
            name="fullName"
            required
            defaultValue={preceptor.full_name}
            placeholder="Nome completo *"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="crmNumber"
            required
            defaultValue={preceptor.crm_number}
            placeholder="CRM *"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="crmState"
            required
            maxLength={2}
            defaultValue={preceptor.crm_state}
            placeholder="UF *"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="specialty"
            defaultValue={preceptor.specialty ?? ''}
            placeholder="Especialidade"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="phone"
            defaultValue={preceptor.phone ?? ''}
            placeholder="Telefone"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            required
            defaultValue={preceptor.email ?? ''}
            placeholder="E-mail *"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />

          {state && !state.success && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

export function EditPreceptorButton({
  preceptor,
  institutions,
  action,
}: {
  preceptor: Preceptor;
  institutions: { id: string; name: string }[];
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setOpenCount((c) => c + 1);
        }}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
        aria-label="Editar"
      >
        <Pencil size={16} />
      </button>

      {open && (
        <EditPreceptorModal
          key={openCount}
          preceptor={preceptor}
          institutions={institutions}
          action={action}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
