import { JustificationForm } from '@/components/solicitacoes/JustificationForm';

export default function JustificarAusenciaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Justificar ausência</h1>
        <p className="text-sm text-slate-500">
          Envie o motivo e, se tiver, um documento comprobatório. A coordenação/preceptor irá analisar.
        </p>
      </div>

      <JustificationForm />
    </div>
  );
}
