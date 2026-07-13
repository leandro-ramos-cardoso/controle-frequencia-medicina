'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { signIn } from '@/lib/auth/actions';

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const result = await signIn(data);
    if (result?.error) setServerError(result.error);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          {/* Substituir por <Image> com a logomarca do sistema */}
          <h1 className="text-xl font-semibold text-slate-900">
            Controle de Frequência — Estágios
          </h1>
          <p className="mt-1 text-sm text-slate-500">Entre com sua conta institucional</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              E-mail ou matrícula
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

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 text-sm text-slate-500"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('keepConnected')} />
              Manter conectado
            </label>
            <Link href="/recuperar-senha" className="font-medium text-slate-700 hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-base font-medium text-white transition disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
