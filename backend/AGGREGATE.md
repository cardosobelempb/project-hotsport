Perfeito! Vou criar um **guia passo a passo completo** em formato Markdown (`.md`) que você pode usar como documentação ou tutorial interno. Esse exemplo vai mostrar como implementar um **Aggregate + Domain Events + Handlers + Fastify + Prisma**, tudo pronto para produção.

---

````markdown
# Guia Prático: Implementando Aggregate com Domain Events em Fastify + Prisma

Este guia mostra como implementar um **Aggregate Root com Domain Events** usando **Fastify**, **Prisma**, **Zod**, e handlers desacoplados.
O padrão é inspirado em **DDD (Domain-Driven Design)** e é altamente escalável.

---

## 1. Estrutura de pastas sugerida

```txt
src/
 ├─ core/
 │   ├─ domain/
 │   │   ├─ entity-domain.ts
 │   │   └─ entity-aggregate.ts
 │   └─ events/
 │       ├─ event-domain.ts
 │       ├─ event-build.ts
 │       └─ index.ts
 ├─ modules/
 │   └─ auth/
 │       ├─ aggregates/
 │       │   └─ auth.aggregate.ts
 │       ├─ events/
 │       │   └─ user-logged-in.event.ts
 │       ├─ handlers/
 │       │   └─ send-login-email.handler.ts
 │       └─ usecases/
 │           └─ auth-login.usecase.ts
 ├─ infra/
 │   └─ prisma/
 │       └─ client.ts
 └─ main.ts
```
````

---

## 2. Criando a base de Domain Events

### 2.1 EventDomain (classe base)

```ts
// src/core/events/event-domain.ts
export abstract class EventDomain<T = any> {
  public readonly occurredAt: Date;

  constructor(public readonly props: T) {
    this.occurredAt = new Date();
  }
}
```

### 2.2 EventBuild (Dispatcher)

```ts
// src/core/events/event-build.ts
import { EntityAggregate } from "@/core/domain/entity-aggregate";
import { EventDomain } from "./event-domain";

type EventHandler = (event: EventDomain) => Promise<void> | void;

export class EventBuild {
  private static handlersMap: Map<string, EventHandler[]> = new Map();
  private static markedAggregates: Set<EntityAggregate<any>> = new Set();

  static register(eventName: string, handler: EventHandler) {
    const handlers = this.handlersMap.get(eventName) || [];
    handlers.push(handler);
    this.handlersMap.set(eventName, handlers);
  }

  static markAggregateForDispatch(aggregate: EntityAggregate<any>) {
    this.markedAggregates.add(aggregate);
  }

  static async dispatchEventsForAggregate(aggregate: EntityAggregate<any>) {
    const events = aggregate.domainEvents;
    for (const event of events) {
      await this.dispatch(event);
    }
    aggregate.clearEvents();
    this.markedAggregates.delete(aggregate);
  }

  private static async dispatch(event: EventDomain) {
    const eventName = event.constructor.name;
    const handlers = this.handlersMap.get(eventName) || [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}
```

---

## 3. Criando o Aggregate Root

```ts
// src/modules/auth/aggregates/auth.aggregate.ts
import { EntityAggregate } from "@/core/domain/entity-aggregate";
import { UserLoggedInEvent } from "../events/user-logged-in.event";

type AuthProps = {
  userId: string;
  email: string;
};

export class AuthAggregate extends EntityAggregate<AuthProps> {
  login() {
    this.registerEvent(
      new UserLoggedInEvent({
        userId: this.props.userId,
        email: this.props.email,
      }),
    );
  }
}
```

---

## 4. Criando um evento de domínio

```ts
// src/modules/auth/events/user-logged-in.event.ts
import { EventDomain } from "@/core/events/event-domain";

type Props = {
  userId: string;
  email: string;
};

export class UserLoggedInEvent extends EventDomain<Props> {}
```

---

## 5. Criando um handler

```ts
// src/modules/auth/handlers/send-login-email.handler.ts
import { UserLoggedInEvent } from "../events/user-logged-in.event";

export async function sendLoginEmailHandler(event: UserLoggedInEvent) {
  console.log("📧 Enviar email para:", event.props.email);
}
```

---

## 6. Registrando handlers

```ts
// src/modules/auth/events/register-events.ts
import { EventBuild } from "@/core/events/event-build";
import { UserLoggedInEvent } from "./user-logged-in.event";
import { sendLoginEmailHandler } from "../handlers/send-login-email.handler";

export function registerAuthEvents() {
  EventBuild.register(UserLoggedInEvent.name, sendLoginEmailHandler);
}
```

> Lembre-se de chamar `registerAuthEvents()` no bootstrap da aplicação (em `main.ts`).

---

## 7. Implementando o Use Case

```ts
// src/modules/auth/usecases/auth-login.usecase.ts
import { prisma } from "@/infra/prisma/client";
import { left, right } from "@/core/either";
import { ConflictError } from "@/core/errors";
import { AuthAggregate } from "../aggregates/auth.aggregate";
import { EventBuild } from "@/core/events/event-build";

export class AuthLoginUseCase {
  static async execute(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true },
    });

    if (!user || !user.auth) {
      return left(new ConflictError("Invalid credentials"));
    }

    const isValid = password === user.auth.passwordHash; // substituir por bcrypt.compare
    if (!isValid) {
      return left(new ConflictError("Invalid credentials"));
    }

    const aggregate = new AuthAggregate({
      userId: user.id,
      email: user.email,
    });

    aggregate.login();

    await EventBuild.dispatchEventsForAggregate(aggregate);

    return right({ user: { id: user.id, email: user.email } });
  }
}
```

---

## 8. Exemplo de Controller (Fastify)

```ts
// src/modules/auth/controllers/auth.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AuthLoginUseCase } from "../usecases/auth-login.usecase";

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authLoginController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { email, password } = LoginBodySchema.parse(request.body);

  const result = await AuthLoginUseCase.execute(email, password);

  if (result.isLeft()) {
    const error = result.value;
    return reply.status(409).send({ message: error.message });
  }

  return reply.status(200).send(result.value);
}
```

---

## 9. Inicializando Fastify e eventos

```ts
// src/main.ts
import Fastify from "fastify";
import { registerAuthEvents } from "./modules/auth/events/register-events";
import { authLoginController } from "./modules/auth/controllers/auth.controller";

const app = Fastify();

registerAuthEvents();

app.post("/login", authLoginController);

app.listen({ port: 3000 }, () => {
  console.log("Server running on http://localhost:3000");
});
```

---

## ✅ Resultado

- Request de login dispara Aggregate
- Aggregate registra evento (`UserLoggedInEvent`)
- EventBuild dispara handler (`sendLoginEmailHandler`)
- API responde rapidamente sem misturar responsabilidades

---

## 10. Próximos passos avançados

- Implementar **BullMQ** para handlers assíncronos
- Implementar **Outbox Pattern** com Prisma para garantir consistência
- Adicionar múltiplos handlers (analytics, audit, webhook)
- Cobrir com testes unitários de Aggregate e Use Case

---

## 💡 Boas práticas

1. **Aggregate não acessa banco**
2. **Handlers são side-effects**, não lógica de negócio
3. **Dispatcher desacoplado**, fácil de escalar
4. **Registrar eventos no bootstrap**
5. **Testar comportamento do Aggregate**, não a API

---

> Esse passo a passo cria uma base sólida para sistemas complexos escaláveis, seguindo princípios de DDD, Clean Code e Domain Events.

```

---

Se você quiser, posso criar **uma segunda versão desse `.md` incluindo BullMQ + Outbox Pattern**, pronta para produção de microsserviços.

Quer que eu faça essa versão avançada?
```
