-- 006_support.sql
-- Anexos, notificações, auditoria e configurações globais.

create table attachments (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references profiles(id),
  related_table text not null,   -- ex: 'attendance_adjustments', 'absence_justifications'
  related_id uuid not null,
  file_path text not null,       -- caminho no Supabase Storage
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);
create index idx_attachments_related on attachments(related_table, related_id);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  type text not null,
  title text not null,
  message text not null,
  channel notification_channel not null default 'sistema',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on notifications(profile_id, read_at);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id),
  action text not null,          -- ex: 'create', 'update', 'approve', 'reject'
  entity text not null,          -- nome da tabela afetada
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index idx_audit_entity on audit_logs(entity, entity_id);
create index idx_audit_actor on audit_logs(actor_profile_id);

create table system_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated_at before update on system_settings
  for each row execute function set_updated_at();
