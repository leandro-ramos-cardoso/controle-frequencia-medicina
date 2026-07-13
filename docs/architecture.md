# Arquitetura

## Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS, componentes acessíveis, ícones Lucide
- React Hook Form + Zod para validação
- Supabase: PostgreSQL, Auth, Storage, RLS, funções server-side, logs de auditoria
- Vercel: hospedagem do frontend e das API routes/Server Actions
- PWA mobile-first, instalável, com fila offline

## Estrutura de pastas sugerida

```
/app
  /(auth)/login
  /(auth)/recuperar-senha
  /aluno/dashboard
  /aluno/registrar-ponto
  /aluno/historico
  /aluno/solicitacoes
  /aluno/perfil
  /preceptor/dashboard
  /preceptor/aprovacoes
  /coordenador/dashboard
  /admin/dashboard
  /admin/cadastros/[entidade]
  /admin/relatorios
  /admin/auditoria
  /acesso-negado
  /offline
  not-found.tsx
/components
  /ui              (botões, cards, inputs — design system)
  /forms
  /dashboard
  /ponto           (registro de ponto, mapa, modal de confirmação)
/lib
  /supabase        (clients: browser, server, admin)
  /validations     (schemas Zod)
  /geolocation     (cálculo de distância, geofence)
/hooks
/types
/supabase
  /migrations
  /seed
```

## Camadas
- **UI (client components):** apenas apresentação e interação; nunca calcula regras de aprovação/geofence sozinha — só exibe o que o backend validou.
- **Server Actions / API routes:** validam com Zod, checam sessão/perfil, gravam `server_recorded_at`, aplicam regras de sequência de ponto e geofence.
- **Supabase:** fonte da verdade, protegida por RLS por perfil (ver `security-rls.md`).

## Autenticação e roteamento
- Middleware do Next.js protege rotas por perfil (`aluno`, `preceptor`, `coordenador`, `administrador`), redirecionando para `/acesso-negado` quando necessário.
- Sessão via Supabase Auth (cookies), com expiração e logout.

## Mapa e geolocalização
- **Mapa:** Leaflet + tiles do OpenStreetMap (`react-leaflet`), escolhido por não exigir
  chave de API nem cartão de crédito — diferente de Google Maps ou Mapbox. Suficiente
  para exibir pino do aluno, pino do local e círculos de raio permitido/atenção.
- **Endereço aproximado:** geocodificação reversa best-effort via Nominatim (OSM),
  gratuita e sem chave; falha silenciosamente sem travar o registro de ponto.
- Se o volume de uso crescer muito, considerar um provedor com SLA (Google Maps
  Geocoding, Mapbox) — troca isolada em `lib/geolocation/reverse-geocode.ts` e
  `components/ponto/LocationMap.tsx`.

## Deploy
- Frontend + funções: Vercel, integrado ao GitHub (deploy automático em push).
- Banco/Auth/Storage: Supabase (ambientes de desenvolvimento e produção separados).
- Variáveis de ambiente configuradas na Vercel e em `.env.local` localmente (ver `.env.example`).
