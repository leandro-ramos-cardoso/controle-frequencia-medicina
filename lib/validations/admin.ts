import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  responsibleName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export const locationSchema = z.object({
  institutionId: z.string().uuid('Selecione a instituição'),
  name: z.string().min(1, 'Informe o nome'),
  type: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  allowedRadiusMeters: z.coerce.number().int().positive().default(100),
  warningRadiusMeters: z.coerce.number().int().positive().default(150),
});

export const preceptorSchema = z.object({
  institutionId: z.string().uuid('Selecione a instituição'),
  fullName: z.string().min(1, 'Informe o nome'),
  crmNumber: z.string().min(1, 'Informe o CRM'),
  crmState: z.string().length(2, 'UF com 2 letras'),
  specialty: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
});

export const studentSchema = z.object({
  institutionId: z.string().uuid('Selecione a instituição'),
  courseId: z.string().uuid('Selecione o curso'),
  fullName: z.string().min(1, 'Informe o nome'),
  email: z.string().email('E-mail inválido'),
  registrationNumber: z.string().min(1, 'Informe a matrícula'),
  requiredHours: z.coerce.number().nonnegative().default(0),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres').optional(),
});

export const systemSettingSchema = z.object({
  key: z
    .string()
    .min(1, 'Informe a chave')
    .regex(/^[a-z0-9_]+$/, 'Use apenas letras minúsculas, números e underscore'),
  value: z.string().min(1, 'Informe o valor'),
  description: z.string().optional(),
});

export const internshipSchema = z.object({
  institutionId: z.string().uuid('Selecione a instituição'),
  courseId: z.string().uuid('Selecione o curso'),
  code: z.string().min(1, 'Informe o código'),
  name: z.string().min(1, 'Informe o nome'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Informe a data inicial'),
  endDate: z.string().min(1, 'Informe a data final'),
  requiredHours: z.coerce.number().nonnegative().default(0),
});
