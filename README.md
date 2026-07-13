# Sistema de Controle de Frequência — Estágios de Medicina

Sistema web mobile-first para registro, validação e gestão de frequência de
alunos de Medicina em estágios práticos, com geolocalização e aprovação por
preceptores.

## Stack
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage, RLS) · Vercel · PWA

## Pré-requisitos
- Node.js 20+ e npm
- Uma conta e um projeto no [Supabase](https://supabase.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para migrations, storage e testes de RLS)

## Instalação

```bash
npm install
cp .env.example .env.local   # preencher com as credenciais do seu projeto Supabase
```

### Banco de dados
Com o Supabase CLI logado e o projeto linkado (`supabase link`):
```bash
supabase db push        # aplica todas as migrations em supabase/migrations
```
Isso cria as tabelas, enums, RLS (migration 007) e o bucket de anexos (migration 008).

### Gerar tipos do TypeScript a partir do schema
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts
```
(`types/database.ts` fica como `any` até essa geração ser rodada pela primeira vez.)

### Rodar localmente
```bash
npm run dev
```

## Estrutura do projeto
Ver `CLAUDE.md` (contexto para desenvolvimento assistido por IA) e a pasta
`docs/` para arquitetura, modelo de dados, regras de negócio, mapa de telas,
segurança/RLS e plano de implementação. `docs/implementation-plan.md` também
lista, na seção "Pendências conhecidas", tudo que ficou de fora do escopo até
agora — vale ler antes de continuar o desenvolvimento.

## Perfis de acesso
Aluno · Preceptor · Coordenador · Administrador — ver `docs/business-rules.md`.

## Testes

Lógica pura (sequência de ponto, geofence, distância, cálculo de horas):
```bash
npm run test          # roda uma vez
npm run test:watch    # modo watch
```

Políticas de RLS (pgTAP, requer Supabase CLI e `supabase init` já rodado no projeto):
```bash
supabase test db
```
`supabase/tests/database/rls_attendance_records.test.sql` cobre o padrão de teste
(isolamento entre alunos, aprovação restrita ao preceptor vinculado, bloqueio de
usuário anônimo). As demais tabelas seguem o mesmo padrão — ainda não escritas.

## Deploy
Ver `docs/deploy.md` para o passo a passo completo (Vercel + Supabase).

## Status
Em desenvolvimento — ainda não implantado em produção. Nenhum dado de
demonstração é real. Ver `CHANGELOG.md` para o que já foi construído e
`docs/implementation-plan.md` para o que falta.
