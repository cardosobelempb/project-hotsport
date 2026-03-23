---
applyTo: 'src/routes/**,src/usecases/**,src/schemas/**,src/errors/**'
---

# Convenções de Rotas e Use Cases

## Rotas (src/routes/)

- SEMPRE REST: `GET /workout-plans`, `GET /workout-plans/:id/days`
- SEMPRE `fastify-type-provider-zod` para schemas
- SEMPRE `tags` e `summary` no schema (Swagger)
- SEMPRE `auth.api.getSession` de `src/lib/auth.ts` para rotas protegidas
- SEMPRE instancie e chame um use case no handler
- SEMPRE trate erros com `try/catch` na rota
- NUNCA regras de negócio na rota

```ts
export const minhaRota = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Domínio'], // obrigatório
      summary: 'Descrição', // obrigatório
      body: MeuSchema.omit({ id: true }),
      response: {
        201: MeuSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema
      }
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      });
      if (!session)
        return reply
          .status(401)
          .send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });

      try {
        const useCase = new MeuUseCase();
        const result = await useCase.execute({
          ...request.body,
          userId: session.user.id
        });
        return reply.status(201).send(result);
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

## Use Cases (src/usecases/)

- SEMPRE classe com método `execute`
- SEMPRE nome PascalCase com verbo: `CreateX`, `UpdateX`, `DeleteX`, `GetX`
- SEMPRE `InputDto` e `OutputDto` no mesmo arquivo
- NUNCA retorne model Prisma direto — mapeie para `OutputDto`
- SEMPRE chame Prisma diretamente — sem repositories
- NUNCA `try/catch` no use case — erros sobem para a rota
- SEMPRE lance erros customizados de `src/errors/index.ts`

```ts
// src/usecases/CreateWorkoutPlan.ts

interface InputDto {
  userId: string;
  name: string;
}
interface OutputDto {
  id: string;
  name: string;
} // nunca o model Prisma

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    // lógica + prisma direto
    // sem try/catch
    // throw new NotFoundError(...) se necessário
    // return mapeado para OutputDto — nunca o model direto
  }
}
```

## Schemas (src/schemas/index.ts)

- SEMPRE centralize todos os schemas aqui
- SEMPRE `z.enum(WeekDay)` de `generated/prisma/enums.js` para dias
- NUNCA `z.string()` para tipos semânticos

## Erros (src/errors/index.ts)

Se o erro necessário não existir, crie-o neste arquivo:

```ts
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
  constructor(msg = 'Resource not found') {
    super(msg, 404, 'NOT_FOUND_ERROR');
  }
}
export class ConflictError extends AppError {
  constructor(msg = 'Resource already exists') {
    super(msg, 409, 'CONFLICT_ERROR');
  }
}
export class ValidationError extends AppError {
  constructor(msg = 'Validation failed') {
    super(msg, 422, 'VALIDATION_ERROR');
  }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Access denied') {
    super(msg, 403, 'FORBIDDEN_ERROR');
  }
}
```
