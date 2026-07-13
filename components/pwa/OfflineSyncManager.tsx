'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { syncQueuedAttendance } from '@/lib/offline/queue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Tenta sincronizar a fila offline ao montar e sempre que a conexão volta.
 * Não renderiza nada visível — o feedback "Aguardando sincronização" fica
 * na própria tela de registro de ponto.
 */
export function OfflineSyncManager() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isOnline || syncingRef.current) return;

    syncingRef.current = true;
    syncQueuedAttendance()
      .then((result) => {
        if (result.synced.length > 0) router.refresh();
      })
      .finally(() => {
        syncingRef.current = false;
      });
  }, [isOnline, router]);

  return null;
}
