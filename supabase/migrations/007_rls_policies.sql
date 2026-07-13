-- 007_rls_policies.sql
-- Habilita RLS em todas as tabelas e define as políticas por perfil.
-- Convenção: auth.uid() = profiles.id (1:1 com auth.users).

-- Função utilitária: retorna o perfil (role) do usuário logado
create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable;

-- Função utilitária: id do registro students/preceptors/coordinators do usuário logado
create or replace function auth_student_id()
returns uuid as $$
  select id from students where profile_id = auth.uid();
$$ language sql stable;

create or replace function auth_preceptor_id()
returns uuid as $$
  select id from preceptors where profile_id = auth.uid();
$$ language sql stable;

-- ============ profiles ============
alter table profiles enable row level security;

create policy "usuario_le_proprio_profile"
  on profiles for select
  using (id = auth.uid() or auth_role() = 'administrador');

create policy "usuario_atualiza_proprio_profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "admin_gerencia_profiles"
  on profiles for all
  using (auth_role() = 'administrador')
  with check (auth_role() = 'administrador');

-- ============ institutions / courses / academic_periods / classes ============
-- Leitura ampla para usuários autenticados (dados não sensíveis); escrita só admin/coordenador.
alter table institutions enable row level security;
alter table courses enable row level security;
alter table academic_periods enable row level security;
alter table classes enable row level security;

create policy "autenticado_le_institutions" on institutions for select using (auth.uid() is not null);
create policy "admin_escreve_institutions" on institutions for all
  using (auth_role() = 'administrador') with check (auth_role() = 'administrador');

create policy "autenticado_le_courses" on courses for select using (auth.uid() is not null);
create policy "admin_coord_escreve_courses" on courses for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

create policy "autenticado_le_periods" on academic_periods for select using (auth.uid() is not null);
create policy "admin_coord_escreve_periods" on academic_periods for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

create policy "autenticado_le_classes" on classes for select using (auth.uid() is not null);
create policy "admin_coord_escreve_classes" on classes for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

-- ============ students ============
alter table students enable row level security;

create policy "aluno_le_proprio_registro"
  on students for select
  using (profile_id = auth.uid());

create policy "preceptor_le_alunos_vinculados"
  on students for select
  using (
    auth_role() = 'preceptor'
    and id in (
      select ist.student_id from internship_students ist
      where ist.preceptor_id = auth_preceptor_id()
    )
  );

create policy "coordenador_le_alunos_do_curso"
  on students for select
  using (
    auth_role() = 'coordenador'
    and course_id in (
      select c.id from courses c
      join coordinators co on co.institution_id = c.institution_id
      where co.profile_id = auth.uid()
    )
  );

create policy "admin_gerencia_students"
  on students for all
  using (auth_role() = 'administrador')
  with check (auth_role() = 'administrador');

-- ============ preceptors / coordinators ============
alter table preceptors enable row level security;
alter table coordinators enable row level security;

create policy "autenticado_le_preceptors" on preceptors for select using (auth.uid() is not null);
create policy "admin_gerencia_preceptors" on preceptors for all
  using (auth_role() = 'administrador') with check (auth_role() = 'administrador');

create policy "proprio_coordenador_le" on coordinators for select using (profile_id = auth.uid());
create policy "admin_gerencia_coordinators" on coordinators for all
  using (auth_role() = 'administrador') with check (auth_role() = 'administrador');

-- ============ internship_locations / internships ============
alter table internship_locations enable row level security;
alter table internships enable row level security;

create policy "autenticado_le_locations" on internship_locations for select using (auth.uid() is not null);
create policy "admin_coord_escreve_locations" on internship_locations for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

create policy "autenticado_le_internships" on internships for select using (auth.uid() is not null);
create policy "admin_coord_escreve_internships" on internships for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

-- ============ internship_students / internship_preceptors / schedules ============
alter table internship_students enable row level security;
alter table internship_preceptors enable row level security;
alter table schedules enable row level security;

create policy "aluno_le_proprio_vinculo"
  on internship_students for select
  using (student_id = auth_student_id());

create policy "preceptor_le_vinculo_dos_seus_alunos"
  on internship_students for select
  using (preceptor_id = auth_preceptor_id());

create policy "admin_coord_gerencia_internship_students"
  on internship_students for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

create policy "preceptor_le_proprio_vinculo"
  on internship_preceptors for select
  using (preceptor_id = auth_preceptor_id());

create policy "admin_coord_gerencia_internship_preceptors"
  on internship_preceptors for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

create policy "autenticado_le_schedules" on schedules for select using (auth.uid() is not null);
create policy "admin_coord_gerencia_schedules" on schedules for all
  using (auth_role() in ('administrador','coordenador'))
  with check (auth_role() in ('administrador','coordenador'));

-- ============ attendance_records (núcleo) ============
alter table attendance_records enable row level security;

create policy "aluno_le_proprios_registros"
  on attendance_records for select
  using (student_id = auth_student_id());

create policy "aluno_cria_proprio_registro"
  on attendance_records for insert
  with check (student_id = auth_student_id());
  -- aluno NUNCA tem policy de UPDATE: ajustes passam por attendance_adjustments

create policy "preceptor_le_registros_dos_seus_alunos"
  on attendance_records for select
  using (preceptor_id = auth_preceptor_id());

create policy "preceptor_aprova_registros_dos_seus_alunos"
  on attendance_records for update
  using (preceptor_id = auth_preceptor_id())
  with check (preceptor_id = auth_preceptor_id());

create policy "coordenador_le_registros_do_curso"
  on attendance_records for select
  using (
    auth_role() = 'coordenador'
    and internship_id in (
      select i.id from internships i
      join coordinators co on co.institution_id = i.institution_id
      where co.profile_id = auth.uid()
    )
  );

create policy "admin_gerencia_attendance_records"
  on attendance_records for all
  using (auth_role() = 'administrador')
  with check (auth_role() = 'administrador');

-- ============ attendance_adjustments ============
alter table attendance_adjustments enable row level security;

create policy "aluno_le_e_cria_proprios_ajustes"
  on attendance_adjustments for select
  using (student_id = auth_student_id());

create policy "aluno_cria_ajuste"
  on attendance_adjustments for insert
  with check (student_id = auth_student_id());

create policy "preceptor_le_e_revisa_ajustes"
  on attendance_adjustments for select
  using (preceptor_id = auth_preceptor_id());

create policy "preceptor_atualiza_status_ajuste"
  on attendance_adjustments for update
  using (preceptor_id = auth_preceptor_id())
  with check (preceptor_id = auth_preceptor_id());

create policy "admin_gerencia_adjustments"
  on attendance_adjustments for all
  using (auth_role() = 'administrador')
  with check (auth_role() = 'administrador');

-- ============ absence_justifications ============
alter table absence_justifications enable row level security;

create policy "aluno_le_e_cria_proprias_justificativas"
  on absence_justifications for select
  using (student_id = auth_student_id());

create policy "aluno_cria_justificativa"
  on absence_justifications for insert
  with check (student_id = auth_student_id());

create policy "preceptor_le_e_revisa_justificativas"
  on absence_justifications for select
  using (preceptor_id = auth_preceptor_id());

create policy "preceptor_atualiza_status_justificativa"
  on absence_justifications for update
  using (preceptor_id = auth_preceptor_id())
  with check (preceptor_id = auth_preceptor_id());

create policy "admin_gerencia_justifications"
  on absence_justifications for all
  using (auth_role() = 'administrador')
  with check (auth_role() = 'administrador');

-- ============ attachments ============
alter table attachments enable row level security;

create policy "dono_le_proprio_anexo"
  on attachments for select
  using (owner_profile_id = auth.uid());

create policy "dono_cria_proprio_anexo"
  on attachments for insert
  with check (owner_profile_id = auth.uid());

create policy "admin_le_todos_anexos"
  on attachments for select
  using (auth_role() = 'administrador');

-- ============ notifications ============
alter table notifications enable row level security;

create policy "usuario_le_proprias_notificacoes"
  on notifications for select
  using (profile_id = auth.uid());

create policy "usuario_marca_lida"
  on notifications for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Notificações são criadas por funções server-side (service_role), sem policy de insert para usuários.

-- ============ audit_logs ============
alter table audit_logs enable row level security;

create policy "admin_le_auditoria"
  on audit_logs for select
  using (auth_role() = 'administrador');

-- audit_logs só é escrito por funções/triggers server-side (service_role).

-- ============ system_settings ============
alter table system_settings enable row level security;

create policy "autenticado_le_settings" on system_settings for select using (auth.uid() is not null);
create policy "admin_escreve_settings" on system_settings for all
  using (auth_role() = 'administrador')
  with check (auth_role() = 'administrador');
