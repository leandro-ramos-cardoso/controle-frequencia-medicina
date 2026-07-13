'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loginSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
  type LoginInput,
  type RequestPasswordResetInput,
  type UpdatePasswordInput,
} from '@/lib/validations/auth';

const ROLE_HOME: Record<string, string> = {
  aluno: '/aluno/dashboard',
  preceptor: '/preceptor/dashboard',
  coordenador: '/coordenador/dashboard',
  administrador: '/admin/dashboard',
};

export async function signIn(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Dados inválidos. Verifique e-mail e senha.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', data.user.id)
    .single();

  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return { error: 'Usuário inativo ou sem perfil cadastrado. Contate o administrador.' };
  }

  redirect(ROLE_HOME[profile.role] ?? '/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordReset(input: RequestPasswordResetInput) {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Informe um e-mail válido.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha/nova-senha`,
  });

  // Não revelar se o e-mail existe ou não (evita enumeração de contas)
  if (error) {
    console.error('Erro ao solicitar recuperação de senha:', error.message);
  }
  return { success: true };
}

export async function updatePassword(input: UpdatePasswordInput) {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: 'Não foi possível atualizar a senha. Tente novamente.' };
  }
  return { success: true };
}
