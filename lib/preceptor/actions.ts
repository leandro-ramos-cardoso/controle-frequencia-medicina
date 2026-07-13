'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { getPreceptorId } from '@/lib/queries/preceptor-dashboard';

type ActionResult = { success: true } | { success: false; error: string };

async function getPreceptorContext() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'preceptor') {
    return { error: 'Sessão inválida. Faça login novamente.' } as const;
  }
  const preceptorId = await getPreceptorId(profile.id);
  if (!preceptorId) {
    return { error: 'Cadastro de preceptor não encontrado.' } as const;
  }
  const supabase = await createClient();
  return { profile, supabase, preceptorId };
}

async function audit(action: string, entity: string, entityId: string, actorProfileId: string) {
  try {
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({ actor_profile_id: actorProfileId, action, entity, entity_id: entityId });
  } catch {
    // auditoria não deve travar a ação principal
  }
}

// ============ Registros de ponto ============

export async function approveAttendanceRecord(recordId: string): Promise<ActionResult> {
  const ctx = await getPreceptorContext();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error, count } = await ctx.supabase
    .from('attendance_records')
    .update({ validation_status: 'aprovado', approved_by: ctx.profile.id, approved_at: new Date().toISOString() })
    .eq('id', recordId)
    .eq('preceptor_id', ctx.preceptorId)
    .select('id', { count: 'exact' });

  if (error || !count) return { success: false, error: 'Não foi possível aprovar o registro.' };

  await audit('approve', 'attendance_records', recordId, ctx.profile.id);
  revalidatePath('/preceptor/aprovacoes');
  return { success: true };
}

export async function rejectAttendanceRecord(recordId: string, reason: string): Promise<ActionResult> {
  if (!reason.trim()) return { success: false, error: 'Informe o motivo da recusa.' };

  const ctx = await getPreceptorContext();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error, count } = await ctx.supabase
    .from('attendance_records')
    .update({ validation_status: 'recusado', rejection_reason: reason, approved_by: ctx.profile.id, approved_at: new Date().toISOString() })
    .eq('id', recordId)
    .eq('preceptor_id', ctx.preceptorId)
    .select('id', { count: 'exact' });

  if (error || !count) return { success: false, error: 'Não foi possível recusar o registro.' };

  await audit('reject', 'attendance_records', recordId, ctx.profile.id);
  revalidatePath('/preceptor/aprovacoes');
  return { success: true };
}

export async function bulkApproveRecords(recordIds: string[]): Promise<ActionResult> {
  const ctx = await getPreceptorContext();
  if ('error' in ctx) return { success: false, error: ctx.error };
  if (recordIds.length === 0) return { success: true };

  const { error } = await ctx.supabase
    .from('attendance_records')
    .update({ validation_status: 'aprovado', approved_by: ctx.profile.id, approved_at: new Date().toISOString() })
    .in('id', recordIds)
    .eq('preceptor_id', ctx.preceptorId);

  if (error) return { success: false, error: 'Não foi possível aprovar os registros selecionados.' };

  for (const id of recordIds) await audit('approve', 'attendance_records', id, ctx.profile.id);
  revalidatePath('/preceptor/aprovacoes');
  return { success: true };
}

// ============ Ajustes de ponto ============

export async function reviewAdjustment(
  adjustmentId: string,
  status: 'aprovada' | 'recusada' | 'necessita_correcao',
  reviewNotes?: string
): Promise<ActionResult> {
  if (status !== 'aprovada' && !reviewNotes?.trim()) {
    return { success: false, error: 'Informe uma observação para recusar ou pedir correção.' };
  }

  const ctx = await getPreceptorContext();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error, count } = await ctx.supabase
    .from('attendance_adjustments')
    .update({ status, review_notes: reviewNotes ?? null, reviewed_by: ctx.profile.id, reviewed_at: new Date().toISOString() })
    .eq('id', adjustmentId)
    .eq('preceptor_id', ctx.preceptorId)
    .select('id', { count: 'exact' });

  if (error || !count) return { success: false, error: 'Não foi possível revisar a solicitação.' };

  await audit(`review:${status}`, 'attendance_adjustments', adjustmentId, ctx.profile.id);
  revalidatePath('/preceptor/aprovacoes');
  return { success: true };
}

// ============ Justificativas de ausência ============

export async function reviewJustification(
  justificationId: string,
  status: 'aprovada' | 'recusada' | 'necessita_correcao',
  reviewNotes?: string
): Promise<ActionResult> {
  if (status !== 'aprovada' && !reviewNotes?.trim()) {
    return { success: false, error: 'Informe uma observação para recusar ou pedir correção.' };
  }

  const ctx = await getPreceptorContext();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const { error, count } = await ctx.supabase
    .from('absence_justifications')
    .update({ status, review_notes: reviewNotes ?? null, reviewed_by: ctx.profile.id, reviewed_at: new Date().toISOString() })
    .eq('id', justificationId)
    .eq('preceptor_id', ctx.preceptorId)
    .select('id', { count: 'exact' });

  if (error || !count) return { success: false, error: 'Não foi possível revisar a justificativa.' };

  await audit(`review:${status}`, 'absence_justifications', justificationId, ctx.profile.id);
  revalidatePath('/preceptor/aprovacoes');
  return { success: true };
}
