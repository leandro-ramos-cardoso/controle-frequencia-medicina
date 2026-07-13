import Link from 'next/link';

export default function AcessoNegadoPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Acesso não permitido</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Sua conta não tem permissão para acessar esta área, ou está inativa. Entre em contato com
        o administrador do sistema se acredita que isso é um engano.
      </p>
      <Link href="/login" className="mt-2 text-sm font-medium text-brand-700 hover:underline">
        Voltar para o login
      </Link>
    </main>
  );
}
