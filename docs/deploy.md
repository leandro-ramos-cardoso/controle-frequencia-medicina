# Deploy

## Visão geral
- **Frontend + Server Actions:** Vercel
- **Banco, Auth, Storage:** Supabase
- Ambientes separados de desenvolvimento e produção (dois projetos Supabase,
  ou um projeto com branches de banco, conforme disponibilidade no seu plano).

## 1. Criar o projeto no Supabase
1. Criar um novo projeto em [supabase.com](https://supabase.com).
2. Anotar `Project URL` e `anon public key` (Settings → API) — vão para o
   `.env` da Vercel como `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Anotar também a `service_role key` — vai para `SUPABASE_SERVICE_ROLE_KEY`
   (⚠️ nunca expor essa chave no frontend; só em variável de ambiente server-side).

## 2. Aplicar o schema
```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```
Isso roda as migrations em `supabase/migrations` na ordem (001 a 008),
incluindo RLS e o bucket de anexos.

## 3. (Opcional) Popular dados de demonstração
Os dados fictícios descritos em `docs/database-schema.md` (seção "Seed de
demonstração") ainda não têm um script de seed pronto — ver
`docs/implementation-plan.md`, item 28 da especificação original. Até lá,
popular manualmente via SQL Editor do Supabase ou pelos próprios cadastros
em `/admin/cadastros` depois do primeiro login administrativo.

## 4. Criar o primeiro usuário administrador
Como o convite de acesso (Admin API) ainda não está implementado (ver
pendências conhecidas), o primeiro administrador precisa ser criado manualmente:
1. Supabase Dashboard → Authentication → Add user (criar com e-mail/senha).
2. Copiar o `id` do usuário criado.
3. No SQL Editor, inserir o profile correspondente:
   ```sql
   insert into profiles (id, full_name, email, role)
   values ('<uuid-do-usuario>', 'Nome do Admin', 'admin@exemplo.com', 'administrador');
   ```

## 5. Deploy do frontend na Vercel
1. Conectar o repositório GitHub do projeto na Vercel.
2. Configurar as variáveis de ambiente (mesmas do `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL de produção, ex: `https://frequencia.suainstituicao.edu.br`)
   - `NEXT_PUBLIC_APP_TIMEZONE=America/Fortaleza`
   - Variáveis de e-mail (`EMAIL_*`), se o envio de notificações por e-mail
     já tiver sido implementado (ainda não estava nas etapas concluídas até aqui).
3. Deploy automático a cada push na branch principal (padrão da Vercel).

## 6. Checklist pós-deploy
- [ ] Login com o usuário administrador criado no passo 4 funciona.
- [ ] `supabase test db` passou localmente antes do deploy (RLS íntegra).
- [ ] Ícones do PWA (`public/icons/*.png`) foram gerados e substituídos —
      ver pendência em `docs/implementation-plan.md`.
- [ ] Domínio configurado com HTTPS (obrigatório para geolocalização e PWA).
- [ ] Testado o registro de ponto em um celular real (GPS de desktop/emulador
      costuma ter baixa precisão e não reflete o uso real).
