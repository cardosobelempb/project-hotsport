# GitHub Copilot — Instruções do Projeto

Leia integralmente. Estas instruções têm prioridade sobre qualquer padrão genérico.

---

## Stack

| Camada          | Tecnologia                                       |
| --------------- | ------------------------------------------------ |
| Runtime         | Node.js (ES Modules)                             |
| Package manager | `npm`                                            |
| Linguagem       | TypeScript — target `ES2024`, `strict: true`     |
| Framework HTTP  | Fastify 5 + `fastify-type-provider-zod`          |
| ORM             | Prisma 7 (output em `src/generated/prisma/`)     |
| Banco           | PostgreSQL via `@prisma/adapter-pg` + `pg`       |
| Autenticação    | `better-auth`                                    |
| Validação       | Zod **v4** — nunca use v3                        |
| Datas           | `dayjs` — nunca use `new Date()` para formatação |
| Build           | `tsup`                                           |
| Dev server      | `tsx --watch`                                    |

---

## Regras Absolutas

- NUNCA use `any` — use `unknown` com narrowing ou modele o tipo
- NUNCA use JavaScript — sempre TypeScript
- NUNCA use Zod v3 — sempre v4
- NUNCA edite `src/generated/` — gerado automaticamente pelo Prisma
- NUNCA retorne o model do Prisma de um use case — mapeie para `OutputDto`
- NUNCA use `try/catch` dentro de use cases — erros são tratados na rota
- NUNCA coloque regras de negócio em rotas — apenas validação e autenticação
- NUNCA faça commit sem permissão explícita do usuário
- NUNCA edite `prisma/migrations/` manualmente
- SEMPRE use `npm` — nunca use `pnpm`, `yarn` ou `bun`

---

## Arquitetura de Camadas

```
routes/      → validação Zod + autenticação better-auth + chamar use case + tratar erros
usecases/    → toda lógica de negócio + Prisma direto + mapear OutputDto (sem try/catch)
schemas/     → schemas Zod centralizados em src/schemas/index.ts
errors/      → erros customizados em src/errors/index.ts
generated/   → NUNCA editar — auto-gerado pelo Prisma
```

Fluxo obrigatório:

```
Route → UseCase → Prisma → OutputDto → Route → JSON Response
```

---

## Organização de Arquivos

| O quê       | Onde                                        |
| ----------- | ------------------------------------------- |
| Rotas       | `src/routes/*-routes.ts` (kebab-case)       |
| Use Cases   | `src/usecases/VerbEntidade.ts` (PascalCase) |
| Schemas Zod | `src/schemas/index.ts`                      |
| Erros       | `src/errors/index.ts`                       |

---

## Comandos

```bash
npm run dev                 # inicia servidor (tsx --watch) — porta 4949
npm run build               # compila com tsup
npm run lint                # ESLint
npm run typecheck           # tsc --noEmit
npm run prisma:generate     # gera Prisma Client
npm run prisma:migrate      # migrations em desenvolvimento
npm run prisma:studio       # GUI de dados
```

---

## Git — Conventional Commits

Sempre use. Nunca comite sem permissão explícita do usuário.

```
feat(usecases): add StartWorkoutSession use case
fix(auth): handle expired JWT token on protected routes
chore: update prisma to v7.4.0
```

Tipos: `feat` `fix` `refactor` `perf` `test` `docs` `style` `chore` `build` `ci` `revert`

---

## Swagger / OpenAPI

Toda rota DEVE ter `tags` e `summary` no schema.
Swagger UI em `http://localhost:4949/docs`.
