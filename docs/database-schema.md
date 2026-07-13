# Modelo de dados (Supabase / PostgreSQL)

## Tabelas
`profiles` · `roles` · `institutions` · `courses` · `classes` · `students` ·
`preceptors` · `coordinators` · `internship_locations` · `internships` ·
`internship_students` · `internship_preceptors` · `schedules` ·
`attendance_records` · `attendance_adjustments` · `absence_justifications` ·
`attachments` · `notifications` · `audit_logs` · `academic_periods` ·
`system_settings`

## attendance_records (núcleo do sistema)
`id, student_id, internship_id, location_id, preceptor_id, record_type,
recorded_at, server_recorded_at, latitude, longitude, accuracy_meters,
distance_meters, address, location_status, validation_status, device_info,
ip_hash, offline_created_at, sync_status, notes, approved_by, approved_at,
rejection_reason, created_at, updated_at`

- `record_type`: entrada | saída | início_intervalo | retorno_intervalo | entrada_extraordinária | saída_extraordinária | atividade_externa | manual_autorizado
- `validation_status`: pendente | aprovado | recusado | em_análise | ajustado | fora_do_perímetro | incompleto | cancelado
- `location_status`: dentro_do_raio | atenção | fora_do_raio
- Nunca aceitar `latitude`/`longitude` digitados manualmente pelo formulário — somente capturados via geolocalização do dispositivo.
- `server_recorded_at` é sempre a fonte de verdade para horário (não confiar em `recorded_at` do cliente).

## preceptors
`id, profile_id, full_name, crm_number, crm_state, specialty, email, phone,
institution_id, active, created_at, updated_at`

## internship_locations
Inclui `latitude`, `longitude`, `raio_permitido_metros` (configurável pelo admin;
padrão sugerido: permitido ≤100m, atenção 100–150m, bloqueado >150m).

## Regras gerais de schema
- Chaves estrangeiras, índices e constraints em todas as tabelas relacionais.
- Enums para `record_type`, `validation_status`, `location_status`, papéis de usuário.
- Campos obrigatórios definidos via `NOT NULL` + validação Zod espelhada no frontend.
- Prevenção de duplicidade (ex.: `UNIQUE` em `(student_id, internship_id, recorded_at)` quando aplicável) + chave de idempotência no registro de ponto.
- Soft delete (`deleted_at`) em tabelas onde exclusão física perderia histórico de auditoria (ex.: `students`, `preceptors`, `attendance_records`).

## Seed de demonstração (dados fictícios, nunca reais)
1 administrador · 1 coordenador · 3 preceptores com CRM · 10 alunos ·
2 instituições · 3 locais · 4 estágios · horários · registros aprovados/pendentes ·
solicitações de ajuste · justificativas.

## Migrations
Manter em `/supabase/migrations`, uma migration por mudança lógica, nomeada
`NNN_descricao.sql`. Aplicar via `npx supabase db push`.
