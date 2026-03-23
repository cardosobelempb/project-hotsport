# Instruções para o Copilot Coding Agent

Leia integralmente antes de executar qualquer tarefa.

---

## Stack

| Camada          | Tecnologia                                       |
| --------------- | ------------------------------------------------ |
| Runtime         | Node.js (ES Modules)                             |
| Package manager | `npm`                                            |
| Linguagem       | TypeScript — target `ES2024`, `strict: true`     |
| Framework HTTP  | Fastify 5 + `fastify-type-provider-zod`          |
| ORM             | Prisma 7 — output em `src/generated/prisma/`     |
| Banco           | PostgreSQL via `@prisma/adapter-pg` + `pg`       |
| Autenticação    | `better-auth`                                    |
| Validação       | Zod v4 — NUNCA use v3                            |
| Datas           | `dayjs` — NUNCA use `new Date()` para formatação |
| Build           | `tsup`                                           |
| Dev server      | `tsx --watch`                                    |

---

## Comandos

```bash
npm run dev                  # inicia servidor (tsx --watch) — porta 4949
npm run build                # compila com tsup
npm run lint                 # ESLint
npm run typecheck            # tsc --noEmit (sem compilar)
npm run prisma:generate      # gera Prisma Client (rodar após alterar schema)
npm run prisma:migrate       # cria e aplica migration (dev)
npm run prisma:deploy        # aplica migration (produção)
npm run prisma:studio        # GUI de dados
```

> ⚠️ NUNCA use `pnpm`, `yarn` ou `bun` — sempre `npm`.
> ⚠️ NUNCA execute `prisma:migrate:reset` ou comandos destrutivos
> sem permissão **explícita** do usuário.

---

## Estrutura de Diretórios

```
src/
├── lib/
│   ├── db.ts           → Prisma Client singleton — NUNCA instancie fora daqui
│   └── auth.ts         → configuração better-auth
├── entities/           → interfaces TypeScript de domínio
├── errors/
│   └── index.ts        → erros customizados (AppError, NotFoundError…)
├── schemas/
│   └── index.ts        → schemas Zod centralizados
├── routes/             → rotas Fastify (sem regras de negócio)
├── usecases/           → lógica de negócio (padrão Use Case)
└── generated/
    └── prisma/         → ⛔ AUTO-GERADO — NUNCA editar

prisma/
├── schema.prisma       → schema do banco
└── migrations/         → ⛔ NUNCA editar manualmente
```

---

## Regras Absolutas — NUNCA Viole

- NUNCA use `any` — use `unknown` com narrowing
- NUNCA use JavaScript — sempre TypeScript
- NUNCA use Zod v3 — sempre v4
- NUNCA edite `src/generated/` manualmente
- NUNCA retorne o model do Prisma de um use case — mapeie para `OutputDto`
- NUNCA use `try/catch` dentro de use cases
- NUNCA coloque regras de negócio em rotas
- NUNCA faça commit sem permissão explícita do usuário
- NUNCA edite `prisma/migrations/` manualmente
- NUNCA use `pnpm`, `yarn` ou `bun` — sempre `npm`

---

## Fluxo Obrigatório

```
Route → UseCase → Prisma → OutputDto → Route → JSON Response
```

| Camada       | Responsabilidade                           | ⛔ Proibido                        |
| ------------ | ------------------------------------------ | ---------------------------------- |
| `routes/`    | Validação + autenticação + usecase + erros | Regras de negócio, Prisma direto   |
| `usecases/`  | Lógica de negócio + mapear OutputDto       | `try/catch`, retornar model Prisma |
| `schemas/`   | Schemas Zod centralizados                  | Lógica condicional                 |
| `errors/`    | Classes de erro customizadas               | Lógica de negócio                  |
| `generated/` | Auto-gerado                                | Qualquer edição manual             |

---

## Git — Conventional Commits

SEMPRE use. NUNCA comite sem permissão explícita do usuário.

```
feat(usecases): add StartWorkoutSession use case
fix(auth): handle expired JWT token
refactor(routes): extract error handler to middleware
chore: update prisma to v7.4.0
```

Tipos: `feat` `fix` `refactor` `perf` `test` `docs` `style` `chore` `build` `ci` `revert`

---

## Checklist antes de entregar qualquer código

```
[ ] npm run typecheck — zero erros TypeScript
[ ] npm run lint — zero erros de lint
[ ] Zero uso de any
[ ] Zero regras de negócio em rotas
[ ] Zero try/catch em use cases
[ ] OutputDto mapeado manualmente (zero model Prisma direto)
[ ] Zod v4 com validadores semânticos (z.email(), z.iso.date()…)
[ ] tags e summary em toda rota nova
[ ] Erros customizados de src/errors/index.ts
[ ] npm run prisma:generate se schema.prisma foi alterado
```
