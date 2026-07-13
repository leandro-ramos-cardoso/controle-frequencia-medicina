'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from '@/lib/validations/auth';
import { requestPasswordReset } from '@/lib/auth/actions';

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({ resolver: zodResolver(requestPasswordResetSchema) });

  async function onSubmit(data: RequestPasswordResetInput) {
    await requestPasswordReset(data);
    setSent(true); // mesma mensagem independentemente do e-mail existir (segurança)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-slate-900">Recuperar senha</h1>
        <p className="mb-6 text-sm text-slate-500">
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {sent ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 py-2.5 text-base font-medium text-white transition disabled:opacity-60"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-slate-700 hover:underline">
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
