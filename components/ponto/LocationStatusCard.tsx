import dynamic from 'next/dynamic';
import { RefreshCw, MapPin } from 'lucide-react';
import type { UseGeolocationReturn } from '@/hooks/useGeolocation';

// Leaflet acessa `window`/`document` — precisa ser carregado só no client.
const LocationMap = dynamic(() => import('./LocationMap').then((m) => m.LocationMap), {
  ssr: false,
  loading: () => <div className="h-48 w-full animate-pulse rounded-xl bg-slate-100" />,
});

const STATUS_TEXT: Record<string, { label: string; className: string }> = {
  dentro_do_raio: { label: 'Dentro do local do estágio', className: 'text-emerald-700 bg-emerald-50' },
  atencao: { label: 'Próximo ao limite do perímetro', className: 'text-amber-700 bg-amber-50' },
  fora_do_raio: { label: 'Fora do perímetro permitido', className: 'text-red-700 bg-red-50' },
};

export function LocationStatusCard({
  geo,
  distanceMeters,
  locationStatus,
  address,
  target,
}: {
  geo: UseGeolocationReturn;
  distanceMeters: number | null;
  locationStatus: 'dentro_do_raio' | 'atencao' | 'fora_do_raio' | null;
  address?: string | null;
  target?: {
    latitude: number;
    longitude: number;
    allowedRadiusMeters: number;
    warningRadiusMeters: number;
  } | null;
}) {
  if (geo.status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white">
          <MapPin size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-800">Precisamos da sua localização</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-700/80">
            É assim que confirmamos que você está no local do estágio. Seu navegador vai
            perguntar uma vez — depois disso não pergunta de novo neste aparelho.
          </p>
        </div>
        <button
          onClick={geo.retry}
          className="mt-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Permitir localização
        </button>
      </div>
    );
  }

  if (geo.status === 'requesting') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
        <RefreshCw size={18} className="animate-spin" />
        Obtendo sua localização...
      </div>
    );
  }

  if (geo.status !== 'granted') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{geo.errorMessage}</p>
        <button
          onClick={geo.retry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm"
        >
          <RefreshCw size={14} /> Tentar novamente
        </button>
      </div>
    );
  }

  const status = locationStatus ? STATUS_TEXT[locationStatus] : null;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <LocationMap
        userLat={geo.latitude!}
        userLon={geo.longitude!}
        targetLat={target?.latitude}
        targetLon={target?.longitude}
        allowedRadiusMeters={target?.allowedRadiusMeters}
        warningRadiusMeters={target?.warningRadiusMeters}
      />

      {status && (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      )}

      <dl className="grid grid-cols-2 gap-y-1 text-sm text-slate-600">
        {address && (
          <>
            <dt className="text-slate-400">Endereço aproximado</dt>
            <dd className="col-span-1">{address}</dd>
          </>
        )}
        <dt className="text-slate-400">Precisão</dt>
        <dd>{geo.accuracyMeters?.toFixed(2)} m</dd>
        <dt className="text-slate-400">Distância do estágio</dt>
        <dd>{distanceMeters !== null ? `${distanceMeters} m` : '—'}</dd>
        <dt className="text-slate-400">Data</dt>
        <dd>{new Date().toLocaleDateString('pt-BR')}</dd>
        <dt className="text-slate-400">Hora</dt>
        <dd>{new Date().toLocaleTimeString('pt-BR')}</dd>
      </dl>

      <button
        onClick={geo.retry}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        <RefreshCw size={13} /> Atualizar localização
      </button>
    </div>
  );
}
