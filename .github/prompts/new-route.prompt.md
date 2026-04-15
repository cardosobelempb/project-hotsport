# Rotas

Crie um novo arquivo de rotas seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

---

## Requisitos obrigatórios

- Arquivo em `{modulo}/infrastructure/routes/` com nome `{modulo}.routes.ts` (kebab-case)
- Registrar rotas via plugin Fastify com `ZodTypeProvider`
- Importar schemas de `{modulo}/infrastructure/schemas/{modulo}.schema.ts`
- Importar use cases do `container.ts`
- NUNCA colocar lógica de negócio na rota — delegar ao controller ou use case
- NUNCA usar `any` nos tipos de request/reply
- Prefixo de URL seguindo o padrão `/{modulo}`

---

## Estrutura obrigatória

```typescript
import { FastifyInstance } from 'fastify';

import {
  authLoginUseCase,
  authRegisterUseCase,
  authSessionUseCase
} from '../../container';
import { authLoginController } from '../controllers/auth-login.controller';
import { authRegisterController } from '../controllers/auth-register.controller';
import { authSessionController } from '../controllers/auth-session.controller';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRegisterController(authRegisterUseCase), {
    prefix: '/register'
  });
  await app.register(authLoginController(authLoginUseCase), {
    prefix: '/login'
  });
  await app.register(authSessionController(authSessionUseCase), {
    prefix: '/session'
  });
}
```

---

## Exemplo

<!-- Adicione aqui uma rota real do projeto como referência -->

```typescript
import { FastifyInstance } from 'fastify';

import {
  authLoginUseCase,
  authRegisterUseCase,
  authSessionUseCase
} from '../../container';
import { authLoginController } from '../controllers/auth-login.controller';
import { authRegisterController } from '../controllers/auth-register.controller';
import { authSessionController } from '../controllers/auth-session.controller';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRegisterController(authRegisterUseCase), {
    prefix: '/register'
  });
  await app.register(authLoginController(authLoginUseCase), {
    prefix: '/login'
  });
  await app.register(authSessionController(authSessionUseCase), {
    prefix: '/session'
  });
}
```

---

## Perguntas

Se as informações não forem fornecidas, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é o **método HTTP**? (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
3. Qual é a **URL**? (ex: `/auth/login`)
4. Precisa de **body**, **params** ou **querystring**?
