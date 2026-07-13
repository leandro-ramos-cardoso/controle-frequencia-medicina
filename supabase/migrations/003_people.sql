-- 003_people.sql
-- Perfis específicos: aluno, preceptor, coordenador — cada um ligado a um profile.

create table students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete cascade,
  institution_id uuid not null references institutions(id),
  course_id uuid not null references courses(id),
  class_id uuid references classes(id),
  registration_number text not null,
  contact_email text,
  birth_date date,
  photo_url text,
  required_hours numeric(7,2) not null default 0,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (institution_id, registration_number)
);
create trigger trg_students_updated_at before update on students
  for each row execute function set_updated_at();
create index idx_students_course on students(course_id);
create index idx_students_class on students(class_id);

create table preceptors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete cascade,
  full_name text not null,
  crm_number text not null,
  crm_state char(2) not null,
  specialty text,
  email text,
  phone text,
  institution_id uuid not null references institutions(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (crm_number, crm_state)
);
create trigger trg_preceptors_updated_at before update on preceptors
  for each row execute function set_updated_at();

create table coordinators (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete cascade,
  institution_id uuid not null references institutions(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_coordinators_updated_at before update on coordinators
  for each row execute function set_updated_at();
