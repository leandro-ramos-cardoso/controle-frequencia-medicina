-- supabase/tests/database/rls_attendance_records.test.sql
--
-- Testes de Row Level Security via pgTAP. Rodar com:
--   supabase test db
--
-- Cobre apenas `attendance_records` (a tabela mais sensível) como exemplo
-- representativo do padrão. As demais tabelas (attendance_adjustments,
-- absence_justifications, students, preceptors...) seguem o mesmo padrão:
-- criar usuários de teste, trocar de "sessão" com `set_test_session()`,
-- tentar SELECT/INSERT/UPDATE e comparar com o esperado.
--
-- Pré-requisito: extensão pgtap habilitada no banco de teste
-- (o Supabase CLI já cuida disso ao rodar `supabase test db`).

begin;
select plan(8);

-- ============ Massa de dados ============

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'aluno.a@teste.com'),
  ('22222222-2222-2222-2222-222222222222', 'aluno.b@teste.com'),
  ('33333333-3333-3333-3333-333333333333', 'preceptor.a@teste.com');

insert into profiles (id, full_name, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'Aluno A', 'aluno.a@teste.com', 'aluno'),
  ('22222222-2222-2222-2222-222222222222', 'Aluno B', 'aluno.b@teste.com', 'aluno'),
  ('33333333-3333-3333-3333-333333333333', 'Preceptor A', 'preceptor.a@teste.com', 'preceptor');

insert into institutions (id, name) values
  ('44444444-4444-4444-4444-444444444444', 'Instituição Teste');

insert into courses (id, institution_id, name) values
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Medicina');

insert into students (id, profile_id, institution_id, course_id, registration_number) values
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'MAT-A'),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'MAT-B');

insert into preceptors (id, profile_id, full_name, crm_number, crm_state, institution_id) values
  ('88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'Preceptor A', '12345', 'PB');

insert into internships (id, institution_id, course_id, code, name, start_date, end_date) values
  ('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'INT-1', 'Estágio Teste', '2026-01-01', '2026-12-31');

-- Registro do Aluno A, sob supervisão do Preceptor A
insert into attendance_records (id, student_id, internship_id, preceptor_id, record_type, recorded_at, idempotency_key) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'entrada', now(), 'key-a');

-- Registro do Aluno B, SEM vínculo com o Preceptor A
insert into attendance_records (id, student_id, internship_id, preceptor_id, record_type, recorded_at, idempotency_key) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', null, 'entrada', now(), 'key-b');

-- ============ Helper para simular sessão autenticada ============

create or replace function set_test_session(user_id uuid) returns void as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', user_id::text, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$ language plpgsql;

-- ============ Testes: Aluno A ============

select set_test_session('11111111-1111-1111-1111-111111111111');

select results_eq(
  $$ select count(*) from attendance_records $$,
  $$ values (1::bigint) $$,
  'Aluno A vê apenas o próprio registro (1 de 2 existentes)'
);

select throws_ok(
  $$ insert into attendance_records (student_id, internship_id, record_type, recorded_at, idempotency_key)
     values ('77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', 'entrada', now(), 'key-forjada') $$,
  'Aluno A não consegue inserir registro em nome do Aluno B (bloqueado pela RLS de INSERT)'
);

select throws_ok(
  $$ update attendance_records set validation_status = 'aprovado' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'Aluno A não consegue aprovar o próprio registro (nenhuma policy de UPDATE para aluno)'
);

-- ============ Testes: Aluno B ============

select set_test_session('22222222-2222-2222-2222-222222222222');

select results_eq(
  $$ select student_id::text from attendance_records $$,
  $$ values ('77777777-7777-7777-7777-777777777777'::text) $$,
  'Aluno B só enxerga o próprio registro, nunca o do Aluno A'
);

-- ============ Testes: Preceptor A ============

select set_test_session('33333333-3333-3333-3333-333333333333');

select results_eq(
  $$ select count(*) from attendance_records $$,
  $$ values (1::bigint) $$,
  'Preceptor A vê apenas o registro do aluno vinculado a ele (Aluno A), não o do Aluno B'
);

select lives_ok(
  $$ update attendance_records set validation_status = 'aprovado', approved_at = now()
     where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'Preceptor A consegue aprovar o registro do aluno vinculado a ele'
);

select throws_ok(
  $$ update attendance_records set validation_status = 'aprovado'
     where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  'Preceptor A NÃO consegue aprovar registro de aluno sem vínculo com ele'
);

-- ============ Teste: usuário anônimo ============

select set_config('role', 'anon', true);
select set_config('request.jwt.claims', '', true);

select is_empty(
  $$ select * from attendance_records $$,
  'Usuário anônimo (sem sessão) não vê nenhum registro de ponto'
);

select * from finish();
rollback;
