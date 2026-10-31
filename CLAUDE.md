@AGENTS.md

# Jukebox

App Android (Expo + React Native + TypeScript) de fila de músicas em festas: quem cria a festa é o
host; os convidados entram pelo código ou QR code, buscam músicas (API pública do iTunes,
`src/lib/itunes.ts`) e pedem; a fila é por ordem de chegada e só o host muda o status (tocar, pular,
já tocou) e abre a música no player dele (Spotify, YouTube Music, Deezer). Telas da festa em
`src/app/party/[id]/`; a fila atualiza em tempo real (Supabase Realtime).

- Backend: Supabase (auth por e-mail/senha). Banco em `supabase/migrations/NNN_nome.sql`: cada
  mudança é uma migração nova (nunca editar uma já aplicada). Com o projeto ligado pelo Supabase CLI,
  `npx supabase migration list --linked` mostra o que falta e `npx supabase db push --linked --dry-run`
  seguido de `npx supabase db push --linked --yes` aplica. Testar o SQL antes (ex.: PGlite) e confirmar com o
  usuário antes de aplicar, pois altera o banco de produção.
- Regras de negócio que outros usuários não podem burlar (ex.: ordem da fila, votos) ficam no banco
  (RLS, funções, triggers), nunca só no app.
- Chaves em `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). O Expo só lê
  variáveis com prefixo `EXPO_PUBLIC_`.
- Consultas ao banco ficam em `src/lib/db.ts`; telas em `src/app/`; tema e componentes em `src/lib/ui.tsx`
  (em migração para a organização da seção "Código" abaixo).
- Ícones, logo e tela de abertura vêm de `public/images/` (ver `app.json`); ícones de interface com
  `@expo/vector-icons` (MaterialIcons).

## Código

Sempre seguir SOLID e Clean Code, com a arquitetura organizada:

- **Responsabilidade única:** cada arquivo, componente, hook e função faz uma coisa só. Se precisar de
  "e" para descrever, dividir.
- **Componentes pequenos:** alvo de até ~150 linhas por arquivo de componente/tela. Passou disso,
  extrair subcomponentes ou hooks.
- **Camadas:**
  - `src/app/`: telas e rotas. Só montam a tela juntando componentes e hooks; sem regra de negócio,
    sem chamar o Supabase direto.
  - `src/components/`: componentes visuais, um por arquivo. `ui/` para os genéricos (botão, card,
    diálogo, abas); pastas por domínio para os específicos (ex.: `party/`).
  - `src/hooks/`: estado, efeitos e orquestração de dados das telas (ex.: `useParty`).
  - `src/lib/`: acesso a dados (`db.ts`), integrações externas (`itunes.ts`), tema e utilitários puros.
- **Nomes claros** em vez de comentários óbvios; comentário só para explicar o porquê.
- **Sem duplicação:** antes de criar, procurar se já existe algo reaproveitável.
- **Escopo:** mudar só o que a tarefa pede. Refatorações fora do escopo são sugeridas, não feitas sem
  o usuário pedir.

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
