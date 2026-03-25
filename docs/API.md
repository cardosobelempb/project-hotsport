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

---

## Microserviço WhatsApp (`whatsappServer.js`)

O `whatsappServer.js` é um microserviço Express independente que gerencia a conexão com o WhatsApp via `@wppconnect-team/wppconnect`. Ele **não é exposto publicamente** — escuta apenas em `127.0.0.1` (loopback).

### Porta e bind

```
127.0.0.1:3030  (padrão — configurável via WHATSAPP_SERVER_PORT)
```

### Autenticação via token

Toda requisição ao endpoint `/send` **deve** incluir o header `x-whatsapp-token` com o valor correto. Caso contrário, a resposta será `401 Unauthorized`.

```
x-whatsapp-token: <valor de WHATSAPP_SERVER_TOKEN>
```

### Variáveis de ambiente

| Variável                  | Descrição                                           | Obrigatório |
| ------------------------- | --------------------------------------------------- | ----------- |
| `WHATSAPP_SERVER_TOKEN`   | Token secreto para autenticar chamadas ao `/send`   | ✅          |
| `WHATSAPP_SERVER_PORT`    | Porta do microserviço (padrão: `3030`)              | ❌          |

### Endpoints

#### `GET /status`

Verifica se o cliente WhatsApp está pronto.

**Resposta 200:**
```json
{ "status": "CONECTADO" }
```

**Resposta 503:**
```json
{ "status": "AGUARDANDO_CONEXAO" }
```

#### `POST /send`

Envia uma mensagem via WhatsApp.

**Header obrigatório:**
```
x-whatsapp-token: <WHATSAPP_SERVER_TOKEN>
```

**Body:**
```json
{
  "telefone": "5591999999999",
  "mensagem": "Seu código OTP é: 123456"
}
```

**Resposta 200:**
```json
{ "sucesso": true, "mensagem": "Enviado com sucesso." }
```

**Resposta 401:**
```json
{ "error": "Unauthorized", "code": "UNAUTHORIZED" }
```

### Exemplo de chamada do backend

```ts
import axios from 'axios';

await axios.post('http://127.0.0.1:3030/send', {
  telefone: '5591999999999',
  mensagem: `Seu código de acesso é: ${otp}`
}, {
  headers: {
    'x-whatsapp-token': process.env.WHATSAPP_SERVER_TOKEN
  }
});
```

### Logs de auditoria

Toda requisição ao `/send` gera logs no stdout com timestamp, status e número de destino:

```
[2024-01-15T10:30:00.000Z] [/send] Requisição recebida - Telefone: 5591999999999
[2024-01-15T10:30:01.200Z] [/send] ✅ Mensagem enviada para 5591999999999
```

Tokens inválidos também são logados:

```
[2024-01-15T10:31:00.000Z] [/send] 401 Unauthorized - IP: 127.0.0.1
```

