# Segurança e Row Level Security

## Regras de RLS por perfil
- **Aluno:** vê e cria apenas os próprios registros (`attendance_records.student_id = auth.uid()` via `profiles`); não pode aprovar o próprio ponto nem alterar data/hora/localização manualmente.
- **Preceptor:** vê apenas alunos vinculados a ele em `internship_preceptors`; pode aprovar/recusar/comentar registros desses alunos.
- **Coordenador:** vê apenas cursos e estágios sob sua coordenação.
- **Administrador:** acesso administrativo amplo, mas ainda auditado.
- Anexos (`attachments`) herdam o mesmo controle de acesso do registro/solicitação ao qual pertencem.
- Nenhuma tabela sensível é pública; `service_role` nunca é exposta no frontend (uso restrito a funções server-side).

## Prevenção de fraude (além de geolocalização)
- Auditoria completa (`audit_logs`) de criação/alteração/aprovação.
- Horário oficial sempre do servidor (`server_recorded_at`).
- Registro de dispositivo/navegador (`device_info`) respeitando privacidade (sem dados excessivos).
- Bloqueio temporário do botão de registro + chave de idempotência para evitar duplicidade.
- Validação de sequência de pontos no backend (não só no cliente).

## Geolocalização
- Solicitar permissão; capturar lat/long + precisão em metros — só quando o
  aluno toca em "Permitir localização" (nunca automaticamente ao abrir a tela,
  para não disparar o prompt nativo sem contexto).
- **Sem geofence/local obrigatório** (mudança de requisito): o aluno pode
  registrar o ponto de qualquer lugar. Coordenadas continuam sendo
  capturadas e gravadas para histórico/auditoria, mas nunca bloqueiam nem
  classificam o registro por distância.
- Tratar: permissão negada, GPS desligado, baixa precisão, tentativa de novo posicionamento.
- Formulário nunca aceita coordenadas digitadas manualmente.

## Conformidade e dados pessoais
- Mínimo necessário de dados pessoais coletados.
- Política de retenção de dados definida em `system_settings`.
- Adequação à LGPD: base legal, finalidade declarada, direito de acesso/correção.
- `ip_hash` em vez de IP em texto puro nos registros de ponto.

## Sessão
- Expiração segura, logout, proteção de rotas por middleware, bloqueio de usuários inativos, redirecionamento por perfil.
