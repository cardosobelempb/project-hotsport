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
// {modulo}.routes.ts

import { UserPrismaRepository } from '@/modulos/user/infrastructure/repositories/user-prisma.repository';

import { env } from '@/core/infrastructure/env';
import { FastifyInstance } from 'fastify';
import { AuthLoginUseCase } from '../../application/usecases/auth-login.use-case';
import { AuthRegisterUseCase } from '../../application/usecases/auth-register.use-case';
import { AuthSessionUseCase } from '../../application/usecases/auth-session.use-case';
import { JwtTokenUseCase } from '../../application/usecases/JwtTokenUseCase';
import { authLoginController } from '../controllers/auth-login.controller';
import { authRegisterController } from '../controllers/auth-register.controller';
import { authSessionController } from '../controllers/auth-session.controller';
import { BcryptHasher } from '../cryptography/bcrypt-hasher';
import { AuthPrismaRepository } from '../repositories/auth-prisma.repository';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const userRepository = new UserPrismaRepository();
  const authRepository = new AuthPrismaRepository();
  const bcryptHasher = new BcryptHasher();
  const jwtTokenUseCase = new JwtTokenUseCase(env); // ✅ Criar instância do JWT encrypter

  const authRegisterUseCase = new AuthRegisterUseCase(
    userRepository,
    authRepository
  );
  const authLoginUseCase = new AuthLoginUseCase(
    userRepository,
    authRepository,
    bcryptHasher,
    jwtTokenUseCase
  );

  const authSessionUseCase = new AuthSessionUseCase(userRepository);

  await app.register(authRegisterController(authRegisterUseCase), {
    prefix: '/register'
  });
  await app.register(authLoginController(authLoginUseCase), {
    prefix: '/login'
  });
  await app.register(authSessionController(authSessionUseCase), {
    prefix: '/session'
  });
  // await app.register(updatePaymentStatusController(userRegisterUseCase), {
  //   prefix: "/:id/status",
  // });
  // await app.register(getPaymentsController(userRegisterUseCase), { prefix: "/" });
}
```

---

## Exemplo

<!-- Adicione aqui uma rota real do projeto como referência -->

```typescript
import { UserPrismaRepository } from '@/modulos/user/infrastructure/repositories/user-prisma.repository';

import { env } from '@/core/infrastructure/env';
import { FastifyInstance } from 'fastify';
import { AuthLoginUseCase } from '../../application/usecases/auth-login.use-case';
import { AuthRegisterUseCase } from '../../application/usecases/auth-register.use-case';
import { AuthSessionUseCase } from '../../application/usecases/auth-session.use-case';
import { JwtTokenUseCase } from '../../application/usecases/JwtTokenUseCase';
import { authLoginController } from '../controllers/auth-login.controller';
import { authRegisterController } from '../controllers/auth-register.controller';
import { authSessionController } from '../controllers/auth-session.controller';
import { BcryptHasher } from '../cryptography/bcrypt-hasher';
import { AuthPrismaRepository } from '../repositories/auth-prisma.repository';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const userRepository = new UserPrismaRepository();
  const authRepository = new AuthPrismaRepository();
  const bcryptHasher = new BcryptHasher();
  const jwtTokenUseCase = new JwtTokenUseCase(env); // ✅ Criar instância do JWT encrypter

  const authRegisterUseCase = new AuthRegisterUseCase(
    userRepository,
    authRepository
  );
  const authLoginUseCase = new AuthLoginUseCase(
    userRepository,
    authRepository,
    bcryptHasher,
    jwtTokenUseCase
  );

  const authSessionUseCase = new AuthSessionUseCase(userRepository);

  await app.register(authRegisterController(authRegisterUseCase), {
    prefix: '/register'
  });
  await app.register(authLoginController(authLoginUseCase), {
    prefix: '/login'
  });
  await app.register(authSessionController(authSessionUseCase), {
    prefix: '/session'
  });
  // await app.register(updatePaymentStatusController(userRegisterUseCase), {
  //   prefix: "/:id/status",
  // });
  // await app.register(getPaymentsController(userRegisterUseCase), { prefix: "/" });
}
```

---

## Perguntas

Se as informações não forem fornecidas, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é o **método HTTP**? (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
3. Qual é a **URL**? (ex: `/auth/login`)
4. Precisa de **body**, **params** ou **querystring**?
