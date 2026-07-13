-- 002_core_and_profiles.sql
-- Estrutura institucional/acadêmica base + profiles (ligado ao Supabase Auth).

create table institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text unique,
  address text,
  responsible_name text,
  phone text,
  email text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_institutions_updated_at before update on institutions
  for each row execute function set_updated_at();

create table courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, name)
);
create trigger trg_courses_updated_at before update on courses
  for each row execute function set_updated_at();

create table academic_periods (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id),
  name text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id),
  academic_period_id uuid references academic_periods(id),
  name text not null,
  created_at timestamptz not null default now()
);

-- profiles: 1:1 com auth.users, carrega o papel do usuário no sistema
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create index idx_profiles_role on profiles(role);
