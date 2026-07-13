import { z } from 'zod';

export const ADJUSTMENT_REASONS = [
  { value: 'esqueceu_registrar', label: 'Esqueceu de registrar' },
  { value: 'horario_incorreto', label: 'Registrou horário incorreto' },
  { value: 'problema_internet', label: 'Problema de internet' },
  { value: 'problema_gps', label: 'Problema com GPS' },
  { value: 'atividade_externa', label: 'Esteve em atividade externa' },
  { value: 'erro_sistema', label: 'Erro no sistema' },
  { value: 'outro', label: 'Outro' },
] as const;

export const adjustmentRequestSchema = z.object({
  attendanceRecordId: z.string().uuid().optional(),
  requestedDate: z.string().min(1, 'Informe a data'),
  requestedTime: z.string().optional(),
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
  reason: z.string().min(1, 'Selecione um motivo'),
  description: z.string().max(1000).optional(),
});
export type AdjustmentRequestInput = z.infer<typeof adjustmentRequestSchema>;

export const absenceJustificationSchema = z
  .object({
    absenceStart: z.string().min(1, 'Informe a data inicial'),
    absenceEnd: z.string().min(1, 'Informe a data final'),
    reason: z.string().min(1, 'Descreva o motivo'),
    description: z.string().max(1000).optional(),
  })
  .refine((data) => data.absenceEnd >= data.absenceStart, {
    message: 'A data final não pode ser anterior à data inicial',
    path: ['absenceEnd'],
  });
export type AbsenceJustificationInput = z.infer<typeof absenceJustificationSchema>;
