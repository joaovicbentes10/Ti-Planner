# Ti Planner

Aplicativo de planejamento de tarefas com interface mobile/web (Expo + React Native) e backend Node.js.

## Stack principal

- Expo Router + React Native
- TypeScript
- tRPC
- Drizzle ORM
- MySQL

## Como rodar localmente

### 1) Instalar dependências

```bash
pnpm install
```

### 2) Rodar app + servidor em modo desenvolvimento

```bash
pnpm dev
```

Esse comando sobe:

- `dev:server` (backend em watch mode)
- `dev:metro` (Expo/Metro para web)

## Scripts úteis

- `pnpm dev` — inicia app e servidor
- `pnpm test` — executa testes (Vitest)
- `pnpm lint` — executa lint
- `pnpm check` — valida tipos TypeScript
- `pnpm build` — build do backend

## Estrutura (visão geral)

- `app/` — rotas e telas (Expo Router)
- `components/` — componentes de UI
- `lib/` — utilitários e integrações cliente
- `server/` — backend e core do servidor
- `drizzle/` — schema/migrations

## Observações

- O projeto usa `pnpm` como gerenciador de pacotes.
- Para recursos de banco, confira os scripts `db:push` no `package.json`.
