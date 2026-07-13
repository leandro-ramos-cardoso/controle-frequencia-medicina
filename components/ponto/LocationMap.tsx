'use client';

import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';

// Ícones padrão do Leaflet quebram com bundlers (Webpack/Next) — usamos
// divIcon com CSS puro em vez de depender dos PNGs do pacote.
function dotIcon(colorClassName: string) {
  return L.divIcon({
    className: '',
    html: `<span class="block h-3.5 w-3.5 rounded-full border-2 border-white shadow ${colorClassName}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function LocationMap({
  userLat,
  userLon,
  targetLat,
  targetLon,
  allowedRadiusMeters,
  warningRadiusMeters,
}: {
  userLat: number;
  userLon: number;
  targetLat?: number;
  targetLon?: number;
  allowedRadiusMeters?: number;
  warningRadiusMeters?: number;
}) {
  const center: [number, number] =
    targetLat !== undefined && targetLon !== undefined ? [targetLat, targetLon] : [userLat, userLon];

  return (
    <div className="h-48 w-full overflow-hidden rounded-xl">
      <MapContainer center={center} zoom={17} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {targetLat !== undefined && targetLon !== undefined && (
          <>
            <Marker position={[targetLat, targetLon]} icon={dotIcon('bg-slate-700')} />
            {allowedRadiusMeters !== undefined && (
              <Circle
                center={[targetLat, targetLon]}
                radius={allowedRadiusMeters}
                pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.08 }}
              />
            )}
            {warningRadiusMeters !== undefined && (
              <Circle
                center={[targetLat, targetLon]}
                radius={warningRadiusMeters}
                pathOptions={{ color: '#d97706', fillColor: '#d97706', fillOpacity: 0.04 }}
              />
            )}
          </>
        )}

        <Marker position={[userLat, userLon]} icon={dotIcon('bg-brand-600')} />
      </MapContainer>
    </div>
  );
}
