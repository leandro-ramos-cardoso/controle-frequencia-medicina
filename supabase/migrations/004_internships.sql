-- 004_internships.sql
-- Locais de estágio, estágios em si, vínculos aluno/preceptor e horários.

create table internship_locations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id),
  name text not null,
  type text,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  allowed_radius_meters integer not null default 100,
  warning_radius_meters integer not null default 150,
  opening_hours jsonb,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (warning_radius_meters >= allowed_radius_meters)
);
create trigger trg_locations_updated_at before update on internship_locations
  for each row execute function set_updated_at();

create table internships (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id),
  course_id uuid not null references courses(id),
  academic_period_id uuid references academic_periods(id),
  code text not null,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  required_hours numeric(7,2) not null default 0,
  attendance_rules jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (institution_id, code),
  check (end_date > start_date)
);
create trigger trg_internships_updated_at before update on internships
  for each row execute function set_updated_at();

create table internship_students (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references internships(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  location_id uuid references internship_locations(id),
  preceptor_id uuid references preceptors(id),
  created_at timestamptz not null default now(),
  unique (internship_id, student_id)
);
create index idx_internship_students_student on internship_students(student_id);

create table internship_preceptors (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references internships(id) on delete cascade,
  preceptor_id uuid not null references preceptors(id) on delete cascade,
  location_id uuid references internship_locations(id),
  created_at timestamptz not null default now(),
  unique (internship_id, preceptor_id, location_id)
);
create index idx_internship_preceptors_preceptor on internship_preceptors(preceptor_id);

create table schedules (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references internships(id) on delete cascade,
  location_id uuid references internship_locations(id),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  tolerance_minutes integer not null default 10,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index idx_schedules_internship on schedules(internship_id);
