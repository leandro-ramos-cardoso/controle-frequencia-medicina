'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import {
  adjustmentRequestSchema,
  absenceJustificationSchema,
} from '@/lib/validations/requests';
import { uploadAttachmentIfPresent } from '@/lib/requests/attachments';

type ActionResult = { success: true } | { success: false; error: string };

async function getStudentContext() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'aluno') {
    return { error: 'Sessão inválida. Faça login novamente.' } as const;
  }

  const supabase = await createClient();
  const { data: student } = await supabase.from('students').select('id').eq('profile_id', profile.id).single();
  if (!student) {
    return { error: 'Cadastro de aluno não encontrado.' } as const;
  }

  const { data: link } = await supabase
    .from('internship_students')
    .select('internship_id, preceptor_id')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { profile, supabase, studentId: student.id, internshipId: link?.internship_id ?? null, preceptorId: link?.preceptor_id ?? null };
}

export async function createAttendanceAdjustment(formData: FormData): Promise<ActionResult> {
  const ctx = await getStudentContext();
  if ('error' in ctx) return { success: false, error: ctx.error };

  const parsed = adjustmentRequestSchema.safeParse({
    attendanceRecordId: formData.get('attendanceRecordId') || undefined,
    requestedDate: formData.get('requestedDate'),
    requestedTime: formData.get('requestedTime') || undefined,
    recordType: formData.get('recordType'),
    reason: formData.get('reason'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const { data: inserted, error } = await ctx.supabase
    .from('attendance_adjustments')
    .insert({
      attendance_record_id: parsed.data.attendanceRecordId ?? null,
      student_id: ctx.studentId,
      requested_date: parsed.data.requestedDate,
      requested_time: parsed.data.requestedTime ?? null,
      record_type: parsed.data.recordType,
      reason: parsed.data.reason,
      description: parsed.data.description ?? null,
      preceptor_id: ctx.preceptorId,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { success: false, error: 'Não foi possível enviar a solicitação. Tente novamente.' };
  }

  const file = formData.get('attachment');
  if (file instanceof File) {
    const uploadResult = await uploadAttachmentIfPresent(ctx.supabase, file, {
      ownerProfileId: ctx.profile.id,
      relatedTable: 'attendance_adjustments',
      relatedId: inserted.id,
    });
    if (uploadResult?.error) {
      return { success: false, error: uploadResult.error };
    }
  }

  return { success: true };
}

export async function createAbsenceJustification(formData: FormData): Promise<ActionResult> {
  const ctx = await getStudentContext();
  if ('error' in ctx) return { success: false, error: ctx.error };
  if (!ctx.internshipId) {
    return { success: false, error: 'Você não está vinculado a nenhum estágio ativo.' };
  }

  const parsed = absenceJustificationSchema.safeParse({
    absenceStart: formData.get('absenceStart'),
    absenceEnd: formData.get('absenceEnd'),
    reason: formData.get('reason'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };
  }

  const { data: inserted, error } = await ctx.supabase
    .from('absence_justifications')
    .insert({
      student_id: ctx.studentId,
      internship_id: ctx.internshipId,
      absence_start: parsed.data.absenceStart,
      absence_end: parsed.data.absenceEnd,
      reason: parsed.data.reason,
      description: parsed.data.description ?? null,
      preceptor_id: ctx.preceptorId,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { success: false, error: 'Não foi possível enviar a justificativa. Tente novamente.' };
  }

  const file = formData.get('attachment');
  if (file instanceof File) {
    const uploadResult = await uploadAttachmentIfPresent(ctx.supabase, file, {
      ownerProfileId: ctx.profile.id,
      relatedTable: 'absence_justifications',
      relatedId: inserted.id,
    });
    if (uploadResult?.error) {
      return { success: false, error: uploadResult.error };
    }
  }

  return { success: true };
}
