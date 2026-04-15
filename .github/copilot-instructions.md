# GitHub Copilot — Instruções do Projeto

Leia integralmente. Estas instruções têm prioridade sobre qualquer padrão genérico.

---

## Stack

| Camada          | Tecnologia                                       |
| --------------- | ------------------------------------------------ | --- |
| Runtime         | Node.js (ES Modules)                             |
| Package manager | `npm`                                            |
| Linguagem       | TypeScript — target `ES2024`, `strict: true`     |
| Framework HTTP  | Fastify 5 + `fastify-type-provider-zod`          |
| ORM             | Prisma 7 (output em `src/generated/prisma/`)     |
| Banco           | PostgreSQL via `@prisma/adapter-pg` + `pg`       |     |
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

# Estrutura do projeto

```
src/
├── modules/
│   └── auth/
│       ├── application/
│       │   ├── mappers/
│       │   │   └── user.mapper.ts              → UserEntity → UserDTOType
│       │   └── use-cases/
│       │       ├── auth-login.use-case.ts
│       │       ├── auth-session.use-case.ts
│       │       ├── auth-refresh.use-case.ts
│       │       └── auth-logout.use-case.ts
│       ├── domain/
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   ├── errors/
│       │   │   └── auth.errors.ts
│       │   └── repositories/
│       │       ├── user.repository.ts          → interface UserRepository
│       │       └── auth.repository.ts          → interface AuthRepository
│       └── infrastructure/
│           ├── controllers/
│           │   └── auth.controller.ts
│           ├── repository/
│           │   ├── user.repo.ts                → implements UserRepository (Prisma)
│           │   └── auth.repo.ts                → implements AuthRepository (Prisma)
│           ├── routes/
│           │   └── auth.routes.ts
│           └── schemas/
│               └── auth.schema.ts
│
├── providers/
│   ├── cryptography/
│   │   ├── hash-comparer.contract.ts           → abstract class HashComparer
│   │   ├── hash-generator.contract.ts          → abstract class HashGenerator
│   │   └── bcryptjs.provider.ts                → implements HashComparer + HashGenerator
│   └── token/
│       ├── token-generator.contract.ts         → abstract class TokenGenerator
│       ├── token-verifier.contract.ts          → abstract class TokenVerifier
│       └── jwt.provider.ts                     → implements TokenGenerator + TokenVerifier
│
├── shared/
│   ├── schemas/
│   │   ├── error-response.schema.ts            → ErrorResponseSchema (reutilizável)
│   │   └── user-dto.schema.ts                  → UserDTOSchema (reutilizável)
│   ├── errors/
│   │   └── error-codes.ts                      → enum ErrorCode
│   └── either.ts                               → Either<L, R>
│
├── app.ts                                      → registra plugins e rotas
├── container.ts                                → injeção de dependência manual
└── server.ts                                   → bootstrap da aplicação

generated/
└── prisma/                                     → NUNCA editar — auto-gerado pelo Prisma
```

---

## Organização de arquivos

| O quê                    | Onde                                                         | Exemplo                     |
| ------------------------ | ------------------------------------------------------------ | --------------------------- |
| Use cases                | `{modulo}/application/use-cases/{modulo}-{acao}.use-case.ts` | `auth-login.use-case.ts`    |
| Mappers                  | `{modulo}/application/mappers/{entidade}.mapper.ts`          | `user.mapper.ts`            |
| Entidades                | `{modulo}/domain/entities/{entidade}.entity.ts`              | `user.entity.ts`            |
| Repositórios (interface) | `{modulo}/domain/repositories/{entidade}.repository.ts`      | `user.repository.ts`        |
| Erros                    | `{modulo}/domain/errors/{modulo}.errors.ts`                  | `auth.errors.ts`            |
| Repositórios (impl)      | `{modulo}/infrastructure/repository/{entidade}.repo.ts`      | `user.repo.ts`              |
| Schemas Zod              | `{modulo}/infrastructure/schemas/{modulo}.schema.ts`         | `auth.schema.ts`            |
| Controllers              | `{modulo}/infrastructure/controllers/{modulo}.controller.ts` | `auth.controller.ts`        |
| Rotas                    | `{modulo}/infrastructure/routes/{modulo}.routes.ts`          | `auth.routes.ts`            |
| Provider (contrato)      | `providers/{categoria}/{servico}.contract.ts`                | `hash-comparer.contract.ts` |
| Provider (impl)          | `providers/{categoria}/{lib}.provider.ts`                    | `bcryptjs.provider.ts`      |
| Schemas compartilhados   | `shared/schemas/{nome}.schema.ts`                            | `error-response.schema.ts`  |
| Erros compartilhados     | `shared/errors/error-codes.ts`                               | `ErrorCode`                 |

---

## Responsabilidade por camada

| Camada                       | Responsabilidade                                       |
| ---------------------------- | ------------------------------------------------------ |
| `application/use-cases`      | regra de negócio, orquestra repositórios e providers   |
| `application/mappers`        | converte `Entity` → `DTO` (value objects → primitivos) |
| `domain/entities`            | modelo de domínio com value objects                    |
| `domain/repositories`        | contratos (interfaces) dos repositórios                |
| `domain/errors`              | erros customizados do módulo                           |
| `infrastructure/repository`  | implementação concreta com Prisma                      |
| `infrastructure/schemas`     | schemas Zod para validação HTTP                        |
| `infrastructure/controllers` | entrada HTTP, extrai cookies/params, chama use case    |
| `infrastructure/routes`      | registra rotas no Fastify                              |
| `providers/cryptography`     | contrato + implementação bcryptjs                      |
| `providers/token`            | contrato + implementação JWT                           |
| `shared/schemas`             | schemas Zod reutilizáveis entre módulos                |
| `container.ts`               | instancia e injeta todas as dependências               |

---

## Replicando para um novo módulo

```
src/modules/{modulo}/
├── application/
│   ├── mappers/
│   │   └── {entidade}.mapper.ts
│   └── use-cases/
│       └── {modulo}-{acao}.use-case.ts
├── domain/
│   ├── entities/
│   │   └── {entidade}.entity.ts
│   ├── errors/
│   │   └── {modulo}.errors.ts
│   └── repositories/
│       └── {entidade}.repository.ts
└── infrastructure/
    ├── controllers/
    │   └── {modulo}.controller.ts
    ├── repository/
    │   └── {entidade}.repo.ts
    ├── routes/
    │   └── {modulo}.routes.ts
    └── schemas/
        └── {modulo}.schema.ts
```

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
