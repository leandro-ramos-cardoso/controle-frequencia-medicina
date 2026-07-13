# Changelog

Registro do que foi construído, por etapa do `docs/implementation-plan.md`.
Não segue SemVer — é um projeto em desenvolvimento, ainda sem release.

## Etapa 15 — Testes
- Vitest para lógica pura: sequência de ponto, cálculo de horas, distância, geofence.
- pgTAP para RLS de `attendance_records` (padrão replicável para as demais tabelas).
- Corrigido: `tsconfig.json`, `next-env.d.ts` e `next.config.mjs` nunca haviam sido criados.

## Etapa 14 — PWA
- Manifest nativo do App Router, service worker (network-first para navegação,
  cache-first para assets), página de fallback offline.
- Fila offline via IndexedDB para registro de ponto sem conexão, com
  sincronização automática ao reconectar (mesma idempotency_key).

## Etapa 13 — Relatórios
- Relatório de frequência por aluno (horas cumpridas/previstas, %, fora do
  perímetro, ausências aprovadas) com filtros por estágio/data.
- Gráficos (recharts): registros por dia, registros por local.
- Exportação PDF (jsPDF), XLSX (SheetJS) e CSV.

## Etapa 12 — Painel administrativo + cadastros
- Dashboard com métricas gerais.
- CRUD (criar + listar + inativar) de instituições, locais de estágio,
  preceptores, alunos e estágios.
- Bucket de storage e schema ajustados on-the-fly (`contact_email` em `students`).

## Etapa 11 — Painel do preceptor
- Dashboard com alunos supervisionados e situação do dia.
- Fila de aprovação (pontos, ajustes, justificativas) com aprovação em lote
  e recusa/correção com motivo obrigatório.

## Etapa 10 — Solicitações
- Ajuste de ponto e justificativa de ausência, com upload de anexo comprobatório.
- Nunca editam o registro original — criam solicitação vinculada.

## Etapa 9 — Histórico
- Lista agrupada por dia com filtros (data, status) via URL.
- Tela de detalhes de um registro específico.

## Etapa 8 — Registro de ponto
- Geolocalização (com tratamento de permissão negada/GPS desligado/timeout).
- Distância e geofence calculados no servidor (nunca confia no cliente).
- Mapa real (Leaflet + OpenStreetMap) e endereço aproximado (Nominatim).
- Idempotência via chave única por tentativa.

## Etapa 7 — Painel do aluno
- Dashboard com estágio atual, botão de ponto contextual, cards de resumo.

## Etapa 6 — Layout principal
- Sidebar recolhível (desktop) e navegação inferior (mobile), tema visual base.

## Etapas 4-5 — Autenticação e RLS
- Login, recuperação de senha, middleware de proteção por perfil.
- RLS completa em todas as tabelas sensíveis (migration 007).

## Etapa 3 — Migrations SQL
- Schema completo: enums, tabelas, FKs, índices, constraints (migrations 001-006).

## Etapas 1-2 — Arquitetura e modelagem
- Definição de stack, estrutura de pastas, modelo de dados.

---

Ver `docs/implementation-plan.md`, seção "Pendências conhecidas", para tudo
que ainda falta (cadastro de cursos, convite de acesso, ícones do PWA, etc.).
