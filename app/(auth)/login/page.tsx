'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
    <main className="flex min-h-dvh flex-col bg-[#F7F3EC] md:flex-row">
      {/* Painel de identidade — vira um banner compacto no mobile, painel lateral no desktop */}
      <div className="relative flex shrink-0 flex-col items-center justify-center overflow-hidden bg-[#123526] px-6 py-10 text-center md:w-[44%] md:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#B08D57] opacity-20 blur-3xl md:top-1/3" />

        <div className="relative flex flex-col items-center">
          <div className="relative h-28 w-28 shrink-0 md:h-40 md:w-40">
            <Image
              src="/images/logo-lamelp.png"
              alt="Liga Acadêmica de Medicina Legal e Perícia Médica da Paraíba — LAMELP-PB"
              fill
              sizes="(min-width: 768px) 160px, 112px"
              className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              priority
            />
          </div>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.25em] text-[#B08D57]">
            LAMELP · Paraíba
          </p>
          <h1 className="mt-2 max-w-xs font-serif text-2xl leading-snug text-[#F7F3EC] md:max-w-sm md:text-3xl">
            Controle de Frequência
            <span className="block text-[#F7F3EC]/70">Estágios de Medicina</span>
          </h1>
          <p className="mt-4 hidden max-w-xs text-sm leading-relaxed text-[#F7F3EC]/60 md:block">
            Registro, validação e acompanhamento de frequência em estágios práticos,
            com geolocalização e aprovação por preceptores.
          </p>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 md:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-serif text-2xl text-[#1C2321]">Entrar</h2>
            <p className="mt-1 text-sm text-[#1C2321]/55">Use sua conta institucional para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1C2321]/80">
                E-mail ou matrícula
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="voce@instituicao.edu.br"
                className="w-full rounded-xl border border-[#1C2321]/15 bg-white px-3.5 py-3 text-[15px] text-[#1C2321] placeholder:text-[#1C2321]/30 transition focus:border-[#123526] focus:outline-none focus:ring-2 focus:ring-[#123526]/15"
                {...register('email')}
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1C2321]/80">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#1C2321]/15 bg-white px-3.5 py-3 pr-11 text-[15px] text-[#1C2321] placeholder:text-[#1C2321]/30 transition focus:border-[#123526] focus:outline-none focus:ring-2 focus:ring-[#123526]/15"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#1C2321]/40 hover:text-[#1C2321]/70"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex items-center gap-2 text-[#1C2321]/60">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#1C2321]/25 text-[#123526] focus:ring-[#123526]/30"
                  {...register('keepConnected')}
                />
                Manter conectado
              </label>
              <Link href="/recuperar-senha" className="font-medium text-[#123526] hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            {serverError && (
              <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-[#123526] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0d2a1d] disabled:opacity-60"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[#1C2321]/35">
            <ShieldCheck size={13} />
            Acesso restrito a alunos, preceptores e coordenação
          </p>
        </div>
      </div>
    </main>
  );
}
