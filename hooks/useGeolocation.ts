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

export type UseGeolocationReturn = GeolocationState & { retry: () => void };

/**
 * Captura a posição atual do dispositivo. Nunca aceita coordenadas digitadas —
 * este hook é a única fonte de latitude/longitude usada no registro de ponto.
 */
export function useGeolocation(): UseGeolocationReturn {
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

  /**
   * Ao montar, só dispara o pedido de localização automaticamente se a
   * permissão já tiver sido concedida antes (nesse caso o navegador nem
   * mostra prompt algum). Se ainda não foi decidida ou foi negada, o hook
   * fica em 'idle' e espera uma chamada explícita a retry() — pedir a
   * permissão "do nada", assim que a tela abre, é o que mais faz as
   * pessoas negarem por reflexo. A UI deve mostrar uma explicação com um
   * botão antes de chamar retry() pela primeira vez.
   */
  useEffect(() => {
    let cancelled = false;

    if (!('geolocation' in navigator)) {
      setState({
        ...initialState,
        status: 'unavailable',
        errorMessage: 'Este dispositivo não suporta geolocalização.',
      });
      return;
    }

    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          if (cancelled) return;
          if (result.state === 'granted') {
            requestLocation();
          }
          // 'prompt' ou 'denied': permanece em 'idle' até o usuário tocar em "Permitir localização".
        })
        .catch(() => {
          // Permissions API indisponível em alguns navegadores — fica em 'idle',
          // o usuário aciona manualmente pelo botão.
        });
    }

    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  return { ...state, retry: requestLocation };
}
