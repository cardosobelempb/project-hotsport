# 🔄 Guia de Migração: Express + MySQL → Fastify + Prisma + TypeScript

## Objetivo

Migrar o backend de forma incremental, **sem quebrar integrações críticas**,
adotando a nova stack: Fastify 5 + Prisma 7 + TypeScript 5 + Zod 4.

---

## Estratégia: Migração Incremental (Strangler Fig Pattern)

```
┌─────────────────────────────────────┐
│  FASE 1: Infraestrutura base        │  TypeScript + Fastify rodando em paralelo
├─────────────────────────────────────┤
│  FASE 2: Banco de dados             │  MySQL → PostgreSQL via Prisma
├─────────────────────────────────────┤
│  FASE 3: Rotas por domínio          │  Auth → Clientes → Planos → Pagamentos
├─────────────────────────────────────┤
│  FASE 4: Integrações críticas       │  MikroTik → Mercado Pago → WhatsApp
├─────────────────────────────────────┤
│  FASE 5: Remoção do código legado   │  Após validação em produção
└─────────────────────────────────────┘
```

> ⚠️ **Nunca migre integrações críticas (MikroTik, MP, WhatsApp) sem
> testes de integração cobrindo os fluxos principais.**

---

## FASE 1 — Setup da Nova Stack

### 1.1 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.2 `src/app.ts` — Factory do Fastify

```ts
import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import cors from '@fastify/cors';
import { env } from '@/lib/env';
import { setupDocs } from '@/lib/swagger';
import { errorHandler } from '@/middleware/errorHandler';
import { clienteRoutes } from '@/routes/clienteRoutes';

export async function buildApp() {
  const app = fastify({ logger: env.NODE_ENV !== 'test' });

  // Integra Zod como validador padrão do Fastify
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // CORS — restrinja em produção!
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
  });

  // Documentação (desabilitar em produção se necessário)
  if (env.NODE_ENV !== 'production') {
    await setupDocs(app);
  }

  // Handler global de erros
  app.setErrorHandler(errorHandler);

  // Registrar rotas por domínio
  await app.register(clienteRoutes, { prefix: '/api' });

  return app;
}
```

### 1.3 `src/server.ts` — Entry point

```ts
import { buildApp } from './app';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`);
    console.log(`📚 Docs em http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
```

---

## FASE 2 — Migração do Banco (MySQL → PostgreSQL)

```bash
# 1. Exportar dados do MySQL
mysqldump -u root -p nome_banco > backup.sql

# 2. Puxar schema existente para o Prisma
npx prisma db pull

# 3. Ajustar schema.prisma (tipos, relações)
# 4. Criar primeira migração
npx prisma migrate dev --name init

# 5. Importar dados (use scripts de seed)
npx prisma db seed
```

---

## FASE 3 — Padrão de Migração por Rota

Para cada rota Express existente, siga este checklist:

```
[ ] 1. Criar schema Zod para body/params/query
[ ] 2. Criar Repository com queries Prisma equivalentes
[ ] 3. Criar Service com a lógica de negócio
[ ] 4. Criar Controller delegando para Service
[ ] 5. Criar Route com schema tipado
[ ] 6. Escrever teste de integração HTTP
[ ] 7. Remover rota Express equivalente
```

---

## Mapeamento Express → Fastify

| Express                      | Fastify                              |
| ---------------------------- | ------------------------------------ |
| `app.use(express.json())`    | Nativo no Fastify                    |
| `req.body`                   | `request.body` (tipado pelo Zod)     |
| `res.json(data)`             | `return data` ou `reply.send(data)`  |
| `res.status(201).json(data)` | `reply.status(201).send(data)`       |
| `next(err)`                  | `throw new AppError(...)`            |
| `app.use('/api', router)`    | `app.register(routes, { prefix })`   |
| `express.Router()`           | `async function plugin(app) { ... }` |

---

## ⚠️ Gotchas Conhecidos

| Gotcha      | Detalhe                                                                        |
| ----------- | ------------------------------------------------------------------------------ |
| Auth dupla  | `server.js` monta `/api/auth` duas vezes. Ao migrar, valide ambos os fluxos    |
| CORS        | Não restrinja sem testar webhooks do Mercado Pago e do WhatsApp                |
| Chrome path | `CHROME_PATH` via env — nunca hardcode                                         |
| Limpeza     | `limpezaRoutes.js` tem endpoints destrutivos. Mantenha salvaguardas explícitas |
| DB modules  | Dois módulos de DB (`db.js` e `src/config/db.js`). Consolide antes de migrar   |
