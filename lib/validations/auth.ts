import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
  keepConnected: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
