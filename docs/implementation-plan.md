# Plano de implementação

Seguir esta ordem. Antes de gerar cada módulo, resumir em poucas linhas:
objetivo, arquivos envolvidos, regra de negócio principal, risco de segurança —
só então gerar código funcional (nunca mockup estático).

1. Arquitetura (confirmar estrutura de pastas — `docs/architecture.md`)
2. Modelagem do banco (revisar `docs/database-schema.md`)
3. Migrations SQL (`/supabase/migrations`)
4. Autenticação (login, recuperação de senha, sessão, proteção de rotas)
5. Políticas de segurança (RLS — `docs/security-rls.md`)
6. Layout principal (sidebar, navegação inferior, tema)
7. Painel do aluno (dashboard)
8. Registro de ponto (geolocalização, geofence, modal de confirmação, idempotência)
9. Histórico (calendário, filtros, detalhes do registro)
10. Solicitações (ajuste de ponto, justificativa de ausência)
11. Painel do preceptor (aprovação, alunos supervisionados)
12. Painel administrativo + cadastros (CRUD de alunos, preceptores, instituições, locais, estágios)
13. Relatórios (filtros, exportação PDF/CSV/XLSX)
14. PWA (manifest, service worker, fila offline)
15. Testes das regras principais (sequência de ponto, geofence, RLS)
16. Documentação (README, instruções de instalação/deploy)
17. Deploy (Vercel + Supabase, variáveis de ambiente)

## Dados de demonstração
Gerar seed fictício (nunca dados reais) conforme `docs/database-schema.md`,
seção "Seed de demonstração".

## Pendências conhecidas (adicionar ao backlog)
- **Cadastro de cursos/turmas/períodos acadêmicos:** não existe tela própria;
  hoje só dá para popular `courses`/`classes`/`academic_periods` via SQL direto.
  Os formulários de aluno/estágio dependem de `courses` já ter dados.
- **Convite de acesso (aluno/preceptor):** `students`/`preceptors` são criados
  sem `profile_id` — falta o fluxo de convite que cria o usuário no Supabase
  Auth e vincula ao registro (Admin API do Supabase, fora do client comum).
- **Gráficos do painel administrativo (item 17 da especificação):** resolvido
  na etapa 13 com `recharts`, implementado em `/admin/relatorios` (não duplicado
  no dashboard).
- **Exportação de relatórios:** resolvida com `xlsx` (SheetJS) para XLSX e
  `jspdf` + `jspdf-autotable` para PDF; CSV é gerado manualmente (sem lib).
- **Relatório de frequência (individual/turma/estágio) está pronto.** Os
  demais tipos do item 19 da especificação (atrasos, ausências, solicitações,
  pontos recusados, pontos fora do perímetro, atividades por preceptor) ainda
  não têm tela própria — seguem o mesmo padrão de `lib/queries/reports.ts` +
  `lib/reports/export.ts`, é só estender.
- **Perfil do preceptor:** o item de navegação existe, a página ainda não.
- **`isWithinSchedule`** no registro de ponto está fixo em `true` — falta
  cruzar com a tabela `schedules`.
- **Ícones do PWA:** `app/manifest.ts` referencia `/icons/icon-192.png`,
  `icon-512.png` e `icon-maskable-512.png`, mas os arquivos ainda não existem
  em `public/icons/` — precisam ser gerados (logomarca do sistema) antes do
  app ser instalável de verdade.
- **Fila offline não é criptografada** (`lib/offline/queue.ts`) — é
  armazenamento local comum via IndexedDB, isolado por origem pelo
  navegador, não cifrado. Se precisar de proteção mais forte, adicionar
  Web Crypto API antes de gravar.
- **Testes de RLS cobrem só `attendance_records`.** `attendance_adjustments`,
  `absence_justifications`, `students`, `preceptors` etc. seguem o mesmo
  padrão em `supabase/tests/database/rls_attendance_records.test.sql`, é só
  replicar. Também falta `supabase/config.toml` (`supabase init` ainda não
  foi rodado neste projeto) — necessário antes de `supabase test db` funcionar.
- **Testes automatizados cobrem só lógica pura + uma tabela de RLS.** Não há
  testes de componente (React Testing Library) nem end-to-end (Playwright)
  ainda — ficou de fora do escopo desta etapa.
