# Sistema de Controle de Frequência — Estágios de Medicina

> Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão.
> Mantenha-o CURTO. Detalhes extensos ficam em `/docs/*` e só devem ser lidos
> sob demanda (ver seção "Quando ler cada doc").

## Stack obrigatória

- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Formulários:** React Hook Form + Zod
- **Backend/dados:** Supabase (PostgreSQL, Auth, Storage, RLS, funções server-side)
- **Hospedagem:** Vercel (frontend/API routes) + Supabase (dados)
- **PWA:** instalável, com suporte a offline básico (fila de sincronização)
- **Idioma da interface:** pt-BR · **Timezone:** America/Fortaleza · Datas no formato brasileiro (dd/mm/aaaa)

## Perfis de acesso

`aluno` · `preceptor` · `coordenador` · `administrador` — permissões detalhadas em `docs/business-rules.md`.

## Convenções do projeto

- Componentes em `PascalCase`, hooks em `useCamelCase`, arquivos de rota conforme padrão do App Router.
- Toda tabela sensível tem RLS habilitada — nunca expor `service_role` no frontend.
- Nenhum dado fictício de demonstração deve parecer dado real (ver `docs/database-schema.md`, seção "Seed").
- Horário de registro de ponto sempre gravado com `server_recorded_at` (nunca confiar só no horário do cliente).
- Commits e nomes de branch em português, mensagens curtas e descritivas.

## Como trabalhar neste projeto (economia de tokens)

1. **Não releia o prompt original inteiro a cada tarefa.** Toda a especificação já foi
   decomposta em `docs/`. Leia apenas o(s) doc(s) relevante(s) para a tarefa atual.
2. **Siga a ordem de implementação** definida em `docs/implementation-plan.md`. Antes de
   gerar um módulo, resuma em 3-5 linhas: objetivo, arquivos envolvidos, regra de negócio
   principal, risco de segurança — depois gere o código.
3. **Não gere mockups estáticos.** Cada tela deve ler/gravar dados reais via Supabase.
4. **Prefira edições pontuais a reescrever arquivos inteiros** quando for ajustar algo já criado.
5. **Pergunte antes de assumir** regras de negócio ambíguas não cobertas em `docs/business-rules.md`.

## Quando ler cada doc

| Preciso de... | Ler |
|---|---|
| Visão geral de arquitetura, pastas, tecnologias | `docs/architecture.md` |
| Tabelas, colunas, relacionamentos, migrations | `docs/database-schema.md` |
| Regras de RLS e segurança | `docs/security-rls.md` |
| Regras de negócio por perfil (o que cada um pode/não pode) | `docs/business-rules.md` |
| Lista de telas e fluxos de navegação | `docs/screens-map.md` |
| Ordem das etapas de desenvolvimento | `docs/implementation-plan.md` |
| Passo a passo de implantação (Vercel + Supabase) | `docs/deploy.md` |

## Comandos úteis

```bash
npm run dev          # ambiente local
npm run build         # build de produção
npm run test           # testes unitários (Vitest)
npx supabase start    # Supabase local (se usado)
npx supabase db push  # aplicar migrations
supabase test db      # testes de RLS (pgTAP)
```

## Variáveis de ambiente

Ver `.env.example` na raiz. Nunca commitar `.env.local`.
