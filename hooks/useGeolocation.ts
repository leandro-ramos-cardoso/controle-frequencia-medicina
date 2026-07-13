'use client';

import { useCallback, useEffect, useState } from 'react';

export type GeolocationState = {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout';
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  errorMessage: string | null;
};

const initialState: GeolocationState = {
  status: 'idle',
  latitude: null,
  longitude: null,
  accuracyMeters: null,
  errorMessage: null,
};

/**
 * Captura a posição atual do dispositivo. Nunca aceita coordenadas digitadas —
 * este hook é a única fonte de latitude/longitude usada no registro de ponto.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(initialState);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({
        ...initialState,
        status: 'unavailable',
        errorMessage: 'Este dispositivo não suporta geolocalização.',
      });
      return;
    }

    setState((prev) => ({ ...prev, status: 'requesting', errorMessage: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'granted',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          errorMessage: null,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({
            ...initialState,
            status: 'denied',
            errorMessage: 'Permissão de localização negada. Habilite nas configurações do navegador.',
          });
        } else if (error.code === error.TIMEOUT) {
          setState({
            ...initialState,
            status: 'timeout',
            errorMessage: 'Tempo esgotado ao obter localização. Tente novamente.',
          });
        } else {
          setState({
            ...initialState,
            status: 'unavailable',
            errorMessage: 'Não foi possível obter sua localização. Verifique se o GPS está ativado.',
          });
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, retry: requestLocation };
}
