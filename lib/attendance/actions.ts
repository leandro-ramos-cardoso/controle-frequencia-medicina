'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import { registerAttendanceSchema, type RegisterAttendanceInput } from '@/lib/validations/attendance';
import { getPointRegistrationContext } from '@/lib/queries/point-registration';
import { distanceInMeters } from '@/lib/geolocation/distance';
import { getLocationStatus } from '@/lib/geolocation/geofence';
import { canTransitionTo } from '@/lib/attendance/next-action';
import type { LocationStatus, ValidationStatus } from '@/types/attendance';

export type RegisterAttendanceResult =
  | { success: true; recordId: string; locationStatus: LocationStatus | null; protocol: string }
  | { success: false; error: string };

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

  let distanceMeters: number | null = null;
  let locationStatus: LocationStatus | null = null;

  if (context.location) {
    distanceMeters = distanceInMeters(
      parsed.data.latitude,
      parsed.data.longitude,
      context.location.latitude,
      context.location.longitude
    );
    locationStatus = getLocationStatus(
      distanceMeters,
      context.location.allowedRadiusMeters,
      context.location.warningRadiusMeters
    );
  }

  const validationStatus: ValidationStatus =
    locationStatus === 'fora_do_raio' ? 'fora_do_perimetro' : 'pendente';

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
      distance_meters: distanceMeters,
      address: parsed.data.address ?? null,
      location_status: locationStatus,
      validation_status: validationStatus,
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
        return {
          success: true,
          recordId: existing.id,
          locationStatus,
          protocol: existing.id.slice(0, 8).toUpperCase(),
        };
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
      new_data: { record_type: parsed.data.recordType, validation_status: validationStatus },
    });
  } catch {
    // Falha de auditoria não deve impedir a confirmação do ponto ao aluno.
  }

  return {
    success: true,
    recordId: inserted.id,
    locationStatus,
    protocol: inserted.id.slice(0, 8).toUpperCase(),
  };
}
