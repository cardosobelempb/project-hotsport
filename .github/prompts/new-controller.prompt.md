# Controller

Crie um novo controller seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

---

## Requisitos obrigatórios

- Arquivo em `{modulo}/infrastructure/controllers/` com nome `{modulo}.controller.ts` (kebab-case)
- Classe com método `handle`
- Receber use case via construtor
- Extrair dados da request (body, params, cookies) e repassar ao use case
- Tratar `result.isLeft()` com o `switch` de erros customizados
- NUNCA colocar regra de negócio no controller
- NUNCA usar try/catch
- Tokens JWT devem ser lidos e escritos apenas via cookie `httpOnly`
- Retornar apenas `reply.status().send()` — nunca `return right(...)` ou similar

---

## Estrutura obrigatória

```typescript
// {modulo}.controller.ts

import { FastifyRequest, FastifyReply } from "fastify";
import { {Modulo}{Acao}UseCase } from "@/modules/{modulo}/application/use-cases/{modulo}-{acao}.use-case";
import { {Modulo}{Acao}BodyType } from "@/modules/{modulo}/infrastructure/schemas/{modulo}.schema";
import { UnauthorizedError } from "@/modules/{modulo}/domain/errors/{modulo}.errors";
import { env } from "@/env";

export class {Modulo}Controller {
  constructor(
    private readonly {modulo}{Acao}UseCase: {Modulo}{Acao}UseCase,
  ) {}

  async handle(
    request: FastifyRequest<{ Body: {Modulo}{Acao}BodyType }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.{modulo}{Acao}UseCase.execute(request.body);

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UnauthorizedError:
          return reply.status(401).send({
            message: error.message,
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: error.error,
          });

        default:
          return reply.status(500).send({
            message: error.message,
            statusCode: 500,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: error.error,
          });
      }
    }

    return reply.status(200).send(result.value);
  }
}
```

---

## Exemplo

<!-- Adicione aqui um controller real do projeto como referência -->

```typescript

```

---

## Perguntas

Se as informações não forem fornecidas, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é a **ação**? (ex: `login`, `create`, `delete`)
3. Quais **erros customizados** podem ocorrer?
4. A resposta precisa setar **cookies**? (ex: `access_token`, `refresh_token`)
