-- 001_enums_and_helpers.sql
-- Enums e função utilitária compartilhada pelas demais migrations.

create extension if not exists "pgcrypto";

create type user_role as enum ('aluno', 'preceptor', 'coordenador', 'administrador');

create type record_type as enum (
  'entrada',
  'saida',
  'inicio_intervalo',
  'retorno_intervalo',
  'entrada_extraordinaria',
  'saida_extraordinaria',
  'atividade_externa',
  'manual_autorizado'
);

create type validation_status as enum (
  'pendente',
  'aprovado',
  'recusado',
  'em_analise',
  'ajustado',
  'fora_do_perimetro',
  'incompleto',
  'cancelado'
);

create type location_status as enum ('dentro_do_raio', 'atencao', 'fora_do_raio');

create type sync_status as enum ('sincronizado', 'pendente_sincronizacao', 'erro_sincronizacao');

create type review_status as enum (
  'enviada',
  'em_analise',
  'aprovada',
  'recusada',
  'necessita_correcao'
);

create type notification_channel as enum ('sistema', 'email', 'push');

-- Função genérica para manter updated_at sempre atualizado
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
