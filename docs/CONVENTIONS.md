---
paths:
  - '**/*.ts'
---

# 📐 Convenções de Código

> Referência canônica de padrões para desenvolvimento.
> **Todos os contribuidores e agentes devem segui-la sem exceção.**

---

## Índice

- [Git e Commits](#git-e-commits)
- [Rotas (Fastify)](#rotas-fastify)
- [Use Cases](#use-cases)
- [Schemas (Zod)](#schemas-zod)
- [Tratamento de Erros](#tratamento-de-erros)

---

## Git e Commits

- **SEMPRE** use [Conventional Commits](https://www.conventionalcommits.org/)
- **NUNCA** faça commit sem **permissão explícita** do usuário

### Tipos válidos

| Tipo       | Quando usar                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | Nova funcionalidade                              |
| `fix`      | Correção de bug                                  |
| `refactor` | Refatoração sem mudança de comportamento externo |
| `perf`     | Melhoria de performance                          |
| `test`     | Adicionar ou corrigir testes                     |
| `docs`     | Apenas documentação                              |
| `style`    | Formatação, espaços (sem lógica)                 |
| `chore`    | Dependências, configuração, manutenção           |
| `build`    | Sistema de build ou scripts                      |
| `ci`       | Pipelines e GitHub Actions                       |
| `revert`   | Reverter commit anterior                         |

### Regras

- Modo **imperativo**: `add`, `fix`, `remove` — não `added`, `fixing`
- Subject com no máximo **72 caracteres**, em **minúsculo**, sem ponto final
- Explique o **porquê** no corpo, se necessário

```bash
# ✅ Corretos
feat(usecases): add StartWorkoutSession use case
fix(auth): handle expired JWT token on protected routes
refactor(routes): extract session validation to middleware
chore: update prisma to v7.4.0

# ❌ Errados
"ajustes" | "WIP" | "fix bug" | "alterações diversas"
```

---

## Rotas (Fastify)

- **SEMPRE** siga REST: `GET /workout-plans`, `GET /workout-plans/:id/days`
- **SEMPRE** crie arquivos em `src/routes/` com nome `kebab-case`
- **SEMPRE** use `fastify-type-provider-zod` para schemas de request e response
- **SEMPRE** use Zod **v4** — nunca v3
- **SEMPRE** inclua `tags` e `summary` no schema (Swagger/OpenAPI)
- **NUNCA** coloque regras de negócio na rota — apenas validação e autenticação
- **SEMPRE** instancie e chame um use case no handler
- **SEMPRE** trate os erros do use case com `try/catch` na rota
- **SEMPRE** use `auth.api.getSession` de `src/lib/auth.ts` para rotas protegidas

### Estrutura obrigatória

```ts
// src/routes/workout-plan-routes.ts

import { fromNodeHeaders } from 'better-auth/node';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { NotFoundError } from '../errors/index.js';
import { auth } from '../lib/auth.js';
import { ErrorSchema, WorkoutPlanSchema } from '../schemas/index.js';
import { CreateWorkoutPlan } from '../usecases/CreateWorkoutPlan.js';

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Workout Plan'], // ← obrigatório
      summary: 'Create a workout plan', // ← obrigatório
      body: WorkoutPlanSchema.omit({ id: true }),
      response: {
        201: WorkoutPlanSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema
      }
    },
    handler: async (request, reply) => {
      // 1. Validar sessão
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      });
      if (!session) {
        return reply
          .status(401)
          .send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      // 2. Instanciar e executar use case
      try {
        const createWorkoutPlan = new CreateWorkoutPlan();
        const result = await createWorkoutPlan.execute({
          userId: session.user.id,
          name: request.body.name,
          workoutDays: request.body.workoutDays
        });
        return reply.status(201).send(result);

        // 3. Tratar erros lançados pelo use case
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError)
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        return reply.status(500).send({
          error: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }
    }
  });
};
```

### Checklist de rota

```
[ ] Arquivo em src/routes/ com nome kebab-case
[ ] withTypeProvider<ZodTypeProvider>()
[ ] Schema com tags e summary preenchidos
[ ] Body e response tipados com schemas de src/schemas/index.ts
[ ] Sessão validada se rota protegida
[ ] Use case instanciado e chamado no handler
[ ] Erros tratados com try/catch
[ ] ZERO regras de negócio
```

---

## Use Cases

- **TODA** regra de negócio fica no use case — nunca na rota
- **SEMPRE** crie em `src/usecases/` com nome `PascalCase` e verbo
- **SEMPRE** implemente como **classe** com método `execute`
- **SEMPRE** defina `InputDto` e `OutputDto` no mesmo arquivo
- **NUNCA** retorne o model do Prisma diretamente — mapeie para `OutputDto`
- **SEMPRE** chame o Prisma diretamente — sem repositories
- **NUNCA** use `try/catch` no use case — erros sobem para a rota
- **SEMPRE** lance erros customizados de `src/errors/index.ts`

### Estrutura obrigatória

```ts
// src/usecases/CreateWorkoutPlan.ts

import { NotFoundError } from '../errors/index.js';
import { WeekDay } from '../generated/prisma/enums.js';
import { prisma } from '../lib/db.js';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

interface OutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

// ─── Use Case ───────────────────────���─────────────────────────────────────────

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: { isActive: true }
    });

    return prisma.$transaction(async tx => {
      if (existingPlan) {
        await tx.workoutPlan.update({
          where: { id: existingPlan.id },
          data: { isActive: false }
        });
      }

      const created = await tx.workoutPlan.create({
        data: {
          id: crypto.randomUUID(),
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map(day => ({
              name: day.name,
              weekDay: day.weekDay,
              isRest: day.isRest,
              estimatedDurationInSeconds: day.estimatedDurationInSeconds,
              exercises: {
                create: day.exercises.map(ex => ({
                  name: ex.name,
                  order: ex.order,
                  sets: ex.sets,
                  reps: ex.reps,
                  restTimeInSeconds: ex.restTimeInSeconds
                }))
              }
            }))
          }
        }
      });

      const result = await tx.workoutPlan.findUnique({
        where: { id: created.id },
        include: { workoutDays: { include: { exercises: true } } }
      });

      // Erro customizado — nunca null silencioso
      if (!result) throw new NotFoundError('Workout plan not found');

      // Mapeia para OutputDto — NUNCA retorne o model Prisma direto
      return {
        id: result.id,
        name: result.name,
        workoutDays: result.workoutDays.map(day => ({
          name: day.name,
          weekDay: day.weekDay,
          isRest: day.isRest,
          estimatedDurationInSeconds: day.estimatedDurationInSeconds,
          exercises: day.exercises.map(ex => ({
            order: ex.order,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            restTimeInSeconds: ex.restTimeInSeconds
          }))
        }))
      };
    });
  }
}
```

### Checklist de use case

```
[ ] Arquivo em src/usecases/ com nome PascalCase verbo
[ ] Classe com método execute()
[ ] InputDto definido no mesmo arquivo
[ ] OutputDto definido no mesmo arquivo
[ ] Retorno mapeado manualmente — zero model Prisma
[ ] Prisma chamado diretamente
[ ] Zero try/catch
[ ] Exceções são erros customizados de src/errors/index.ts
```

---

## Schemas (Zod)

- **SEMPRE** Zod **v4** — nunca v3
- **SEMPRE** centralize em `src/schemas/index.ts`
- **SEMPRE** use `ErrorSchema` para respostas de erro
- **SEMPRE** `z.enum(WeekDay)` de `generated/prisma/enums.js` para dias
- **NUNCA** `z.string()` para tipos semânticos

```ts
// src/schemas/index.ts

import { z } from 'zod';
import { WeekDay } from '../generated/prisma/enums.js';

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string()
});

export const ExerciseSchema = z.object({
  order: z.number().int().positive(),
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  restTimeInSeconds: z.number().int().nonnegative()
});

export const WorkoutDaySchema = z.object({
  name: z.string().min(1),
  weekDay: z.enum(WeekDay), // ← nunca z.string()
  isRest: z.boolean(),
  estimatedDurationInSeconds: z.number().int().nonnegative(),
  exercises: z.array(ExerciseSchema)
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  workoutDays: z.array(WorkoutDaySchema)
});
```

---

## Tratamento de Erros

```ts
// src/errors/index.ts

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN_ERROR');
    this.name = 'ForbiddenError';
  }
}
```

### Padrão de catch nas rotas

```ts
} catch (error) {
  app.log.error(error)
  if (error instanceof NotFoundError)
    return reply.status(404).send({ error: error.message, code: error.code })
  if (error instanceof ConflictError)
    return reply.status(409).send({ error: error.message, code: error.code })
  if (error instanceof ValidationError)
    return reply.status(422).send({ error: error.message, code: error.code })
  if (error instanceof ForbiddenError)
    return reply.status(403).send({ error: error.message, code: error.code })
  return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" })
}
```

---

## Regras de Documentação (obrigatório)

Todo desenvolvimento deve manter a documentação atualizada. **Nenhum PR deve ser mergeado com docs desatualizados.**

### O que atualizar em cada situação

| Situação                                          | Docs a atualizar                                     |
| ------------------------------------------------- | ---------------------------------------------------- |
| Nova feature ou endpoint                          | `docs/API.md`                                        |
| Mudança em autenticação, roles ou geração de JWT  | `docs/ARCHITECTURE.md`                               |
| Mudança no banco de dados ou schema Prisma        | `docs/DATABASE.md` e/ou `docs/MIGRATION.md`          |
| Nova migração SQL                                 | `docs/MIGRATION.md`                                  |
| Mudança em variáveis de ambiente                  | `docs/ENVIRONMENT.md`                                |
| Mudança em integração RADIUS ou tabelas `radius`  | `docs/RADIUS.md`                                     |

### Regras para issues e PRs

- Todo PR deve indicar no template/descrição: **"Docs impactados"** (ex: `API.md`, `DATABASE.md`, `nenhum`).
- Ao criar uma issue, **sempre preencher** o campo **"O que precisa ser criado?"** — não deixar em branco.
- Se a issue não impactar docs, explicar brevemente o motivo no campo de docs.

### Checklist de documentação antes do merge

```
[ ] docs/API.md atualizado (se há novos endpoints ou mudança de contrato)
[ ] docs/ARCHITECTURE.md atualizado (se há mudança em auth/JWT/roles/estrutura)
[ ] docs/DATABASE.md ou docs/MIGRATION.md atualizado (se há mudança de schema/migração)
[ ] docs/RADIUS.md atualizado (se há mudança na integração FreeRADIUS)
[ ] Campo "Docs impactados" preenchido no PR
[ ] Issue com campo "O que precisa ser criado?" preenchido
```
