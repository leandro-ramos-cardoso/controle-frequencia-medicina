'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth/get-profile';
import {
  institutionSchema,
  locationSchema,
  preceptorSchema,
  studentSchema,
  internshipSchema,
} from '@/lib/validations/admin';

type ActionResult = { success: true } | { success: false; error: string };

async function getAdminContext() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'administrador') {
    return { error: 'Apenas administradores podem realizar esta ação.' } as const;
  }
  const supabase = await createClient();
  return { profile, supabase };
}

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? 'Dados inválidos.';
}

// ============ Instituições ============

export async function createInstitution(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const parsed = institutionSchema.safeParse({
    name: formData.get('name'),
    cnpj: formData.get('cnpj') || undefined,
    address: formData.get('address') || undefined,
    responsibleName: formData.get('responsibleName') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  const { error } = await ctx.supabase.from('institutions').insert({
    name: parsed.data.name,
    cnpj: parsed.data.cnpj || null,
    address: parsed.data.address || null,
    responsible_name: parsed.data.responsibleName || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
  });
  if (error) return { success: false, error: 'Não foi possível cadastrar a instituição (verifique o CNPJ).' };

  revalidatePath('/admin/cadastros/instituicoes');
  return { success: true };
}

export async function deactivateInstitution(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const { error } = await ctx.supabase.from('institutions').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: 'Não foi possível remover a instituição.' };

  revalidatePath('/admin/cadastros/instituicoes');
  return { success: true };
}

// ============ Locais de estágio ============

export async function createLocation(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const parsed = locationSchema.safeParse({
    institutionId: formData.get('institutionId'),
    name: formData.get('name'),
    type: formData.get('type') || undefined,
    address: formData.get('address') || undefined,
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    allowedRadiusMeters: formData.get('allowedRadiusMeters') || undefined,
    warningRadiusMeters: formData.get('warningRadiusMeters') || undefined,
  });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  const { error } = await ctx.supabase.from('internship_locations').insert({
    institution_id: parsed.data.institutionId,
    name: parsed.data.name,
    type: parsed.data.type || null,
    address: parsed.data.address || null,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    allowed_radius_meters: parsed.data.allowedRadiusMeters,
    warning_radius_meters: parsed.data.warningRadiusMeters,
  });
  if (error) return { success: false, error: 'Não foi possível cadastrar o local.' };

  revalidatePath('/admin/cadastros/locais');
  return { success: true };
}

export async function deactivateLocation(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const { error } = await ctx.supabase.from('internship_locations').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: 'Não foi possível remover o local.' };

  revalidatePath('/admin/cadastros/locais');
  return { success: true };
}

// ============ Preceptores ============

export async function createPreceptor(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const parsed = preceptorSchema.safeParse({
    institutionId: formData.get('institutionId'),
    fullName: formData.get('fullName'),
    crmNumber: formData.get('crmNumber'),
    crmState: formData.get('crmState'),
    specialty: formData.get('specialty') || undefined,
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  const { error } = await ctx.supabase.from('preceptors').insert({
    institution_id: parsed.data.institutionId,
    full_name: parsed.data.fullName,
    crm_number: parsed.data.crmNumber,
    crm_state: parsed.data.crmState.toUpperCase(),
    specialty: parsed.data.specialty || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  });
  if (error) return { success: false, error: 'Não foi possível cadastrar o preceptor (verifique o CRM/UF).' };

  revalidatePath('/admin/cadastros/preceptores');
  return { success: true };
}

export async function deactivatePreceptor(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const { error } = await ctx.supabase.from('preceptors').update({ active: false }).eq('id', id);
  if (error) return { success: false, error: 'Não foi possível inativar o preceptor.' };

  revalidatePath('/admin/cadastros/preceptores');
  return { success: true };
}

// ============ Alunos ============
// O cadastro cria o acesso do aluno no Supabase Auth (via Admin API,
// service_role) já no momento do cadastro, para que o e-mail informado
// possa ser usado na tela de "recuperar senha" e o aluno defina sua senha.

async function createAuthProfile(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  fullName: string,
  role: 'aluno'
): Promise<{ profileId: string } | { error: string }> {
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data.user) {
    const alreadyExists = error?.message?.toLowerCase().includes('already');
    return {
      error: alreadyExists
        ? 'Já existe um usuário cadastrado com este e-mail.'
        : 'Não foi possível criar o acesso do aluno (verifique o e-mail).',
    };
  }

  const profileId = data.user.id;
  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: profileId, full_name: fullName, email, role });
  if (profileError) {
    await admin.auth.admin.deleteUser(profileId);
    return { error: 'Não foi possível criar o perfil do aluno.' };
  }

  return { profileId };
}

export async function createStudent(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const parsed = studentSchema.safeParse({
    institutionId: formData.get('institutionId'),
    courseId: formData.get('courseId'),
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    registrationNumber: formData.get('registrationNumber'),
    requiredHours: formData.get('requiredHours') || undefined,
  });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  const admin = createAdminClient();
  const authResult = await createAuthProfile(admin, parsed.data.email, parsed.data.fullName, 'aluno');
  if ('error' in authResult) return { success: false, error: authResult.error };

  const { error } = await ctx.supabase.from('students').insert({
    profile_id: authResult.profileId,
    institution_id: parsed.data.institutionId,
    course_id: parsed.data.courseId,
    registration_number: parsed.data.registrationNumber,
    contact_email: parsed.data.email,
    required_hours: parsed.data.requiredHours,
  });
  if (error) {
    await admin.from('profiles').delete().eq('id', authResult.profileId);
    await admin.auth.admin.deleteUser(authResult.profileId);
    return { success: false, error: 'Não foi possível cadastrar o aluno (verifique a matrícula).' };
  }

  revalidatePath('/admin/cadastros/alunos');
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const parsed = studentSchema.safeParse({
    institutionId: formData.get('institutionId'),
    courseId: formData.get('courseId'),
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    registrationNumber: formData.get('registrationNumber'),
    requiredHours: formData.get('requiredHours') || undefined,
  });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  const { data: student, error: fetchError } = await ctx.supabase
    .from('students')
    .select('id, profile_id')
    .eq('id', id)
    .single();
  if (fetchError || !student) return { success: false, error: 'Aluno não encontrado.' };

  const admin = createAdminClient();
  let profileId = student.profile_id as string | null;

  if (profileId) {
    const { error: authError } = await admin.auth.admin.updateUserById(profileId, { email: parsed.data.email });
    if (authError) return { success: false, error: 'Não foi possível atualizar o e-mail de acesso (já em uso?).' };
    await admin
      .from('profiles')
      .update({ full_name: parsed.data.fullName, email: parsed.data.email })
      .eq('id', profileId);
  } else {
    const authResult = await createAuthProfile(admin, parsed.data.email, parsed.data.fullName, 'aluno');
    if ('error' in authResult) return { success: false, error: authResult.error };
    profileId = authResult.profileId;
  }

  const { error } = await ctx.supabase
    .from('students')
    .update({
      profile_id: profileId,
      institution_id: parsed.data.institutionId,
      course_id: parsed.data.courseId,
      registration_number: parsed.data.registrationNumber,
      contact_email: parsed.data.email,
      required_hours: parsed.data.requiredHours,
    })
    .eq('id', id);
  if (error) return { success: false, error: 'Não foi possível atualizar o aluno (verifique a matrícula).' };

  revalidatePath('/admin/cadastros/alunos');
  return { success: true };
}

export async function deactivateStudent(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const { error } = await ctx.supabase.from('students').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: 'Não foi possível remover o aluno.' };

  revalidatePath('/admin/cadastros/alunos');
  return { success: true };
}

// ============ Estágios ============

export async function createInternship(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const parsed = internshipSchema.safeParse({
    institutionId: formData.get('institutionId'),
    courseId: formData.get('courseId'),
    code: formData.get('code'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    requiredHours: formData.get('requiredHours') || undefined,
  });
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  const { error } = await ctx.supabase.from('internships').insert({
    institution_id: parsed.data.institutionId,
    course_id: parsed.data.courseId,
    code: parsed.data.code,
    name: parsed.data.name,
    description: parsed.data.description || null,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    required_hours: parsed.data.requiredHours,
  });
  if (error) return { success: false, error: 'Não foi possível cadastrar o estágio (verifique o código).' };

  revalidatePath('/admin/cadastros/estagios');
  return { success: true };
}

export async function deactivateInternship(id: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const { error } = await ctx.supabase.from('internships').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: 'Não foi possível remover o estágio.' };

  revalidatePath('/admin/cadastros/estagios');
  return { success: true };
}

// ============ Configurações do sistema ============

export async function updateSystemSetting(key: string, formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if ('error' in ctx) return { success: false, error: ctx.error as string };

  const rawValue = formData.get('value');
  if (typeof rawValue !== 'string' || rawValue.trim() === '') {
    return { success: false, error: 'Informe um valor.' };
  }

  let value: unknown = rawValue;
  try {
    value = JSON.parse(rawValue);
  } catch {
    // valor simples (texto/número não-JSON) é salvo como string
  }

  const { error } = await ctx.supabase
    .from('system_settings')
    .update({ value, updated_by: ctx.profile.id })
    .eq('key', key);
  if (error) return { success: false, error: 'Não foi possível salvar a configuração.' };

  revalidatePath('/admin/configuracoes');
  return { success: true };
}
