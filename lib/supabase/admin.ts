import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Client administrativo com service_role — ignora RLS.
 * NUNCA importar este arquivo em Client Components.
 * Uso restrito a: jobs administrativos, funções server-side que
 * precisam operar entre perfis (ex: aprovação em lote, relatórios agregados).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
