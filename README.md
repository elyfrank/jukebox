<h1 align="center">Jukebox</h1>

<p align="center">A fila de músicas que todo mundo escolhe junto.</p>

Jukebox é um app Android de fila de músicas em grupo. Numa festa, num bar ou num carro cheio,
as pessoas entram na mesma sala, sugerem músicas e votam nas próximas que vão tocar.

> **Status:** projeto no começo. Por enquanto o app tem só a base: conta, perfil e tema. A sala e
> a fila vêm a seguir.

## Funcionalidades

- **Conta com e-mail e senha**. A confirmação por código enviado por e-mail também está pronta, mas fica desligada até o projeto ter SMTP próprio (veja abaixo).
- **Configurações**: editar o nome, tema claro, escuro ou do sistema e sair da conta.

### Planejado

- **Salas** com código de convite, criadas por quem vai controlar o som.
- **Fila de músicas**: cada pessoa sugere músicas e a fila se reordena pelos votos.
- **Tempo real**: a fila atualiza na hora para todos da sala (Supabase Realtime).

## Tecnologias

- [Expo](https://expo.dev) (SDK 58) e React Native, com TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) para a navegação
- [Supabase](https://supabase.com): autenticação, banco Postgres e regras de segurança (RLS)
- [EAS Build](https://docs.expo.dev/build/introduction/) para gerar o APK na nuvem

## Estrutura

```
src/
  app/                  telas (Expo Router: cada arquivo é uma rota)
    (tabs)/             abas Fila e Configurações
    sign-in.tsx         login, cadastro e confirmação por código
  lib/
    db.ts               todas as consultas ao banco
    supabase.ts         cliente do Supabase
    auth.tsx            sessão do usuário
    ui.tsx              tema (claro/escuro) e componentes básicos
supabase/
  migrations/           mudanças no banco, numeradas e aplicadas em ordem
```

## Como rodar

### Pré-requisitos

- Node.js 24 (o projeto tem `.nvmrc`; com nvm, rode `nvm use`)
- Um projeto no [Supabase](https://supabase.com)
- O app **Expo Go** no celular Android
- Uma conta [Expo](https://expo.dev), necessária para o túnel e para os builds

### 1. Instalar as dependências

```bash
nvm use
npm install
```

### 2. Configurar o Supabase

Copie `.env.example` para `.env` e preencha com os dados do seu projeto, que ficam em
*Project Settings → API Keys*:

```
EXPO_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use só a chave **publishable**. Nunca coloque a chave secreta nem a senha do banco no app.

### 3. Criar o banco

Com o [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
npx supabase db push --linked
```

Se preferir não usar o CLI, cole cada arquivo de `supabase/migrations/` no **SQL Editor** do
Supabase, em ordem (001, 002, …).

### Confirmação de e-mail

Deixe a confirmação de e-mail **desligada** (*Authentication → Sign In / Providers → Email →
Confirm email*): quem se cadastra entra direto. O motivo é que o servidor de e-mail gratuito do
Supabase só envia o template padrão, em inglês e com um link que não abre o app, e não permite
editar os templates.

Para ligar a confirmação:

1. Configure um SMTP próprio em *Authentication → Emails → Set up SMTP* (por exemplo, o Gmail com
   uma senha de app, ou um serviço como o Resend).
2. Edite o template *Confirm signup* para enviar o **código** `{{ .Token }}` em vez do link.
3. Ligue de novo o **Confirm email**.

O app já trata esse fluxo: depois do cadastro, ele pede o código e tem um botão para reenviá-lo.

### 4. Abrir no celular

```bash
npx expo login
npx expo start --tunnel
```

Abra o **Expo Go** com a mesma conta e escolha o projeto, ou escaneie o QR code.

> **No WSL:** se o `npx expo login` der erro ao abrir o navegador, rode
> `BROWSER=none npx expo login` e abra o link manualmente.

## Gerar o APK

Na primeira vez, ligue o projeto ao EAS (isso grava o `projectId` no `app.json`):

```bash
npx eas-cli@latest init
```

As variáveis do `.env` não vão para a nuvem. Por isso, elas precisam estar cadastradas no EAS
(uma vez só):

```bash
npx eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_URL --value "<url>" --visibility plaintext
npx eas-cli@latest env:set preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "<chave>" --visibility sensitive
```

Depois:

```bash
npx eas-cli@latest build -p android --profile preview
```

Quando o build terminar, o EAS mostra o link para baixar o `.apk` e instalar no celular.

## Mudanças no banco

Cada mudança no banco é uma **migração nova** em `supabase/migrations/NNN_nome.sql`. Nunca edite
uma migração que já foi aplicada. Para ver e aplicar as pendentes:

```bash
npx supabase migration list --linked
npx supabase db push --linked --dry-run   # simula
npx supabase db push --linked             # aplica
```

## Comandos úteis

```bash
npx expo start --tunnel   # servidor de desenvolvimento
npx tsc --noEmit          # checagem de tipos
npx expo lint             # lint
npx expo-doctor           # diagnóstico de dependências e configuração
```

## Licença

[MIT](LICENSE) © 2026 Ely Frank
