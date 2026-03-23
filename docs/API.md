# 🔌 Contratos de API

## Padrões Gerais

- Todas as rotas são prefixadas com `/api`
- Autenticação via **JWT Bearer Token** no header `Authorization`
- Respostas sempre em JSON
- Paginação padrão: `?page=1&limit=20`

---

## Documentação Automática

A API usa `@fastify/swagger` + `@scalar/fastify-api-reference`.

### Acessar docs localmente

```
http://localhost:3001/docs        → Scalar UI (recomendado)
http://localhost:3001/swagger     → Swagger JSON
```

### Configuração (`src/lib/swagger.ts`)

```ts
import fastifySwagger from '@fastify/swagger';
import scalarApiReference from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';

export async function setupDocs(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'API - Sistema ISP',
        description: 'API principal do sistema de gestão',
        version: '1.0.0'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  });

  await app.register(scalarApiReference, {
    routePrefix: '/docs'
  });
}
```

---

## Definindo Rotas com Schema Zod

```ts
// src/routes/clienteRoutes.ts

import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { clienteController } from '@/controllers/clienteController';
import { authMiddleware } from '@/middleware/auth';

// Schema de entrada — validação automática pelo Fastify
const criarClienteSchema = {
  schema: {
    tags: ['Clientes'],
    summary: 'Criar novo cliente',
    security: [{ bearerAuth: [] }],
    body: z.object({
      nome: z.string().min(2).describe('Nome completo'),
      email: z.string().email().describe('Email válido'),
      cpf: z.string().length(11).describe('CPF sem formatação')
    }),
    response: {
      201: z.object({
        id: z.number(),
        nome: z.string(),
        email: z.string()
      }),
      409: z.object({ erro: z.string() })
    }
  }
};

export async function clienteRoutes(app: FastifyInstance) {
  // Proteger todas as rotas deste plugin
  app.addHook('onRequest', authMiddleware);

  app.post('/clientes', criarClienteSchema, clienteController.criar);
  app.get('/clientes', clienteController.listar);
  app.get('/clientes/:id', clienteController.buscarPorId);
  app.put('/clientes/:id', clienteController.atualizar);
  app.delete('/clientes/:id', clienteController.remover);
}
```

---

## Padrão de Resposta de Erro

```json
{
  "erro": "Cliente não encontrado",
  "codigo": "CLIENTE_NAO_ENCONTRADO",
  "statusCode": 404
}
```

## Padrão de Resposta de Lista

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Endpoints por Domínio

| Domínio    | Prefixo           | Auth?             |
| ---------- | ----------------- | ----------------- |
| Auth       | `/api/auth`       | ❌                |
| Clientes   | `/api/clientes`   | ✅                |
| Planos     | `/api/planos`     | ✅                |
| Pagamentos | `/api/pagamentos` | ✅                |
| Webhooks   | `/api/webhooks`   | ❌ (IP whitelist) |
| WhatsApp   | `/api/whatsapp`   | ✅                |
| Radius     | `/api/radius`     | ✅                |
| Admin      | `/api/admin`      | ✅ (role: admin)  |
