import { z } from 'zod';

export const registerAttendanceSchema = z.object({
  recordType: z.enum([
    'entrada',
    'saida',
    'inicio_intervalo',
    'retorno_intervalo',
    'entrada_extraordinaria',
    'saida_extraordinaria',
    'atividade_externa',
    'manual_autorizado',
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().nonnegative(),
  address: z.string().max(500).optional(),
  offlineCreatedAt: z.string().datetime().optional(),
  idempotencyKey: z.string().uuid(),
  deviceInfo: z
    .object({
      userAgent: z.string().max(500),
      platform: z.string().max(100).optional(),
    })
    .optional(),
});
export type RegisterAttendanceInput = z.infer<typeof registerAttendanceSchema>;
