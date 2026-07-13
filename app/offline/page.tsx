import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <WifiOff size={36} className="text-slate-400" />
      <h1 className="text-lg font-semibold text-slate-900">Você está sem conexão</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Algumas telas precisam de internet para carregar dados atualizados. Registros de ponto
        feitos sem conexão ficam salvos no aparelho e são enviados automaticamente quando a
        internet voltar.
      </p>
    </main>
  );
}
