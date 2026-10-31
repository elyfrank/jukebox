@AGENTS.md

# Jukebox

App Android (Expo + React Native + TypeScript) de fila de músicas em grupo: as pessoas entram numa
sala, sugerem músicas e votam nas próximas. Por enquanto só existe a base (login, perfil, tema); a
aba Fila (`src/app/(tabs)/index.tsx`) é um espaço reservado.

- Backend: Supabase (auth por e-mail/senha). Banco em `supabase/migrations/NNN_nome.sql`: cada
  mudança é uma migração nova (nunca editar uma já aplicada). Com o projeto ligado pelo Supabase CLI,
  `npx supabase migration list --linked` mostra o que falta e `npx supabase db push --linked --dry-run`
  seguido de `npx supabase db push --linked --yes` aplica. Testar o SQL antes (ex.: PGlite) e confirmar com o
  usuário antes de aplicar, pois altera o banco de produção.
- Regras de negócio que outros usuários não podem burlar (ex.: ordem da fila, votos) ficam no banco
  (RLS, funções, triggers), nunca só no app.
- Chaves em `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). O Expo só lê
  variáveis com prefixo `EXPO_PUBLIC_`.
- Consultas ao banco ficam em `src/lib/db.ts`; telas em `src/app/`; tema e componentes em `src/lib/ui.tsx`.
- Ainda sem `projectId` do EAS e sem ícone/logo: `npx eas-cli@latest init` antes do primeiro build.

## Ambiente

- WSL2. Node via nvm: o padrão global é v14, então rode `source ~/.nvm/nvm.sh && nvm use` (lê `.nvmrc`,
  Node 24) antes de qualquer comando npm/npx/expo.
- Para testar no celular (Expo Go): `npx expo start --tunnel`.
- GitHub por SSH (`git@github.com:elyfrank/jukebox.git`); HTTPS trava no credential manager do Windows.

## Regras de git

- NUNCA adicionar `Co-Authored-By` nem qualquer linha de atribuição ao Claude em commits ou PRs.
- NUNCA commitar `.claude/`, `.env` ou `.idea/`.
- Só commitar/fazer push quando o usuário pedir.

## Comunicação

- Responder em português.
