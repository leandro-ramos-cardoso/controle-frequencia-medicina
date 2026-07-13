import { idbPut, idbGetAll, idbDelete } from './indexeddb';
import { registerAttendance } from '@/lib/attendance/actions';
import type { RegisterAttendanceInput } from '@/lib/validations/attendance';

export type QueuedAttendance = RegisterAttendanceInput & { offlineCreatedAt: string };

/**
 * Guarda um registro de ponto localmente quando não há conexão (ou o envio
 * falhou por rede). NÃO é criptografia real — é armazenamento local
 * comum (IndexedDB), isolado por origem pelo navegador. Se a exigência de
 * "protegido" precisar ser mais forte que isso, adicionar uma camada de
 * cifragem simétrica antes de gravar (ex: Web Crypto API com chave derivada
 * da sessão) — não implementado nesta etapa.
 */
export async function queueAttendance(input: RegisterAttendanceInput): Promise<void> {
  const record: QueuedAttendance = { ...input, offlineCreatedAt: new Date().toISOString() };
  await idbPut(record);
}

export async function getQueuedAttendance(): Promise<QueuedAttendance[]> {
  return idbGetAll<QueuedAttendance>();
}

export type SyncResult = { synced: string[]; failed: string[] };

/**
 * Tenta enviar todos os registros pendentes. Usa a mesma Server Action e a
 * mesma idempotency_key gerada no momento do registro original — o servidor
 * trata reenvio como confirmação do mesmo registro, nunca duplica.
 */
export async function syncQueuedAttendance(): Promise<SyncResult> {
  const pending = await getQueuedAttendance();
  const result: SyncResult = { synced: [], failed: [] };

  for (const item of pending) {
    try {
      const response = await registerAttendance(item);
      if (response.success) {
        await idbDelete(item.idempotencyKey);
        result.synced.push(item.idempotencyKey);
      } else {
        result.failed.push(item.idempotencyKey);
      }
    } catch {
      // provavelmente ainda sem rede — mantém na fila para a próxima tentativa
      result.failed.push(item.idempotencyKey);
    }
  }

  return result;
}
