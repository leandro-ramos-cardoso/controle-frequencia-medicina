-- 008_storage.sql
-- Bucket privado para anexos (comprovantes de ajuste/justificativa) e suas policies.
-- Convenção de caminho: {profile_id}/{related_table}/{uuid}-{filename}

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "usuario_le_proprios_anexos"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "usuario_envia_proprios_anexos"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "preceptor_le_anexos_relacionados"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and auth_role() in ('preceptor', 'coordenador', 'administrador')
  );
-- Observação: a policy do preceptor é ampla por simplicidade nesta etapa.
-- Se necessário restringir por vínculo aluno-preceptor, mover a checagem
-- para uma função que confirme o relacionamento antes de liberar o select.
