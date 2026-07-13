import { createClient } from '@/lib/supabase/server';

export type CurrentProfile = {
  id: string;
  full_name: string;
  email: string;
  role: 'aluno' | 'preceptor' | 'coordenador' | 'administrador';
  active: boolean;
};

/**
 * Retorna o profile do usuário autenticado (ou null).
 * Uso em Server Components/Actions para checar perfil além do middleware
 * (defesa em profundidade — o middleware já bloqueia, mas cada tela deve
 * confirmar o perfil antes de exibir dados sensíveis).
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, active')
    .eq('id', user.id)
    .single();

  return profile ?? null;
}
