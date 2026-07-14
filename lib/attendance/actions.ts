'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { registerAttendanceSchema, type RegisterAttendanceInput } from '@/lib/validations/attendance';
import { getPointRegistrationContext } from '@/lib/queries/point-registration';
import { canTransitionTo } from '@/lib/attendance/next-action';

export type RegisterAttendanceResult =
  | { success: true; recordId: string; protocol: string }
  | { success: false; error: string };

/**
 * Não há mais local/geofence obrigatório — o aluno pode registrar o ponto
 * de qualquer lugar. As coordenadas ainda são capturadas e gravadas (para
 * histórico/auditoria), mas nunca bloqueiam ou classificam o registro.
 */
export async function registerAttendance(
  input: RegisterAttendanceInput
): Promise<RegisterAttendanceResult> {
  const parsed = registerAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Dados de localização inválidos. Tente novamente.' };
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'aluno') {
    return { success: false, error: 'Sessão inválida. Faça login novamente.' };
  }

  const context = await getPointRegistrationContext(profile.id);
  if (!context) {
    return { success: false, error: 'Você não está vinculado a nenhum estágio ativo.' };
  }

  // Validação de sequência no servidor (nunca confiar só no botão do cliente)
  const lastType = context.lastRecordToday?.record_type ?? null;
  if (!canTransitionTo(lastType, parsed.data.recordType)) {
    return {
      success: false,
      error: 'Este registro não é permitido agora — verifique a sequência do seu ponto.',
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: inserted, error } = await supabase
    .from('attendance_records')
    .insert({
      student_id: context.studentId,
      internship_id: context.internshipId,
      location_id: context.location?.id ?? null,
      preceptor_id: context.preceptorId,
      record_type: parsed.data.recordType,
      recorded_at: now,
      server_recorded_at: now,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracy_meters: parsed.data.accuracyMeters,
      address: parsed.data.address ?? null,
      validation_status: 'pendente',
      device_info: parsed.data.deviceInfo ?? null,
      idempotency_key: parsed.data.idempotencyKey,
      offline_created_at: parsed.data.offlineCreatedAt ?? null,
      sync_status: 'sincronizado',
    })
    .select('id')
    .single();

  if (error) {
    // 23505 = violação de unicidade (student_id, idempotency_key) — reenvio do mesmo registro
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('student_id', context.studentId)
        .eq('idempotency_key', parsed.data.idempotencyKey)
        .single();

      if (existing) {
        return { success: true, recordId: existing.id, protocol: existing.id.slice(0, 8).toUpperCase() };
      }
    }
    return { success: false, error: 'Não foi possível gravar o registro. Tente novamente.' };
  }

  // Auditoria via service_role — usuários não têm policy de insert em audit_logs
  try {
    const admin = createAdminClient();
    await admin.from('audit_logs').insert({
      actor_profile_id: profile.id,
      action: 'create',
      entity: 'attendance_records',
      entity_id: inserted.id,
      new_data: { record_type: parsed.data.recordType, validation_status: 'pendente' },
    });
  } catch {
    // Falha de auditoria não deve impedir a confirmação do ponto ao aluno.
  }

  return { success: true, recordId: inserted.id, protocol: inserted.id.slice(0, 8).toUpperCase() };
}
