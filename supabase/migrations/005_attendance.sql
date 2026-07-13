-- 005_attendance.sql
-- Núcleo do sistema: registros de ponto, solicitações de ajuste e justificativas.

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  internship_id uuid not null references internships(id),
  location_id uuid references internship_locations(id),
  preceptor_id uuid references preceptors(id),
  record_type record_type not null,
  recorded_at timestamptz not null,          -- horário informado pelo cliente
  server_recorded_at timestamptz not null default now(), -- fonte da verdade
  latitude double precision,
  longitude double precision,
  accuracy_meters numeric(8,2),
  distance_meters numeric(8,2),
  address text,
  location_status location_status,
  validation_status validation_status not null default 'pendente',
  device_info jsonb,
  ip_hash text,
  offline_created_at timestamptz,
  sync_status sync_status not null default 'sincronizado',
  idempotency_key text not null,
  notes text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, idempotency_key)
);
create trigger trg_attendance_records_updated_at before update on attendance_records
  for each row execute function set_updated_at();
create index idx_attendance_student_time on attendance_records(student_id, server_recorded_at desc);
create index idx_attendance_internship on attendance_records(internship_id);
create index idx_attendance_status on attendance_records(validation_status);

create table attendance_adjustments (
  id uuid primary key default gen_random_uuid(),
  attendance_record_id uuid references attendance_records(id),
  student_id uuid not null references students(id),
  requested_date date not null,
  requested_time time,
  record_type record_type not null,
  reason text not null,
  description text,
  preceptor_id uuid references preceptors(id),
  status review_status not null default 'enviada',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_adjustments_updated_at before update on attendance_adjustments
  for each row execute function set_updated_at();
create index idx_adjustments_student on attendance_adjustments(student_id);

create table absence_justifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  internship_id uuid not null references internships(id),
  absence_start date not null,
  absence_end date not null,
  reason text not null,
  description text,
  preceptor_id uuid references preceptors(id),
  notes text,
  status review_status not null default 'enviada',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (absence_end >= absence_start)
);
create trigger trg_justifications_updated_at before update on absence_justifications
  for each row execute function set_updated_at();
create index idx_justifications_student on absence_justifications(student_id);
