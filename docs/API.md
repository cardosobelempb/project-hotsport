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

## Autenticação via OTP

### `POST /auth/otp/request`

Solicita um código OTP de 6 dígitos para o número de WhatsApp informado. O código é armazenado com hash bcrypt e tem validade de **5 minutos**. Existe um rate-limit de **1 requisição a cada 2 minutos** por CPF.

**Body (JSON):**

| Campo      | Tipo     | Obrigatório | Descrição                                               |
| ---------- | -------- | ----------- | ------------------------------------------------------- |
| `cpf`      | `string` | ✅          | CPF do usuário (com ou sem formatação, 11–14 caracteres) |
| `phone`    | `string` | ✅          | Telefone no formato E.164 ou local (10–20 caracteres)    |
| `name`     | `string` | ❌          | Nome completo do usuário (opcional)                      |

> **Formato de telefone E.164:** `+5591999999999` (código do país + DDD + número). O backend normaliza automaticamente adicionando o prefixo `55` caso ausente.

**Exemplo de request:**

```json
{
  "cpf": "123.456.789-01",
  "phone": "+5591999999999"
}
```

**Respostas:**

| Status | Corpo                                                                 | Descrição                                   |
| ------ | --------------------------------------------------------------------- | ------------------------------------------- |
| `200`  | `{ "message": "Código enviado com sucesso" }`                         | OTP gerado e enviado via WhatsApp           |
| `500`  | `{ "error": "Erro interno ao gerar OTP", "code": "INTERNAL_SERVER_ERROR" }` | Falha interna                         |

**Exemplo de resposta 200:**

```json
{ "message": "Código enviado com sucesso" }
```

**Exemplo de resposta 500:**

```json
{
  "error": "Erro interno ao gerar OTP",
  "code": "INTERNAL_SERVER_ERROR"
}
```

---

### `POST /auth/otp/verify`

Valida o código OTP informado. Após verificação bem-sucedida, o OTP é marcado como usado. Máximo de **5 tentativas** por OTP.

**Body (JSON):**

| Campo  | Tipo     | Obrigatório | Descrição                                |
| ------ | -------- | ----------- | ---------------------------------------- |
| `cpf`  | `string` | ✅          | CPF do usuário (11–14 caracteres)        |
| `otp`  | `string` | ✅          | Código OTP de exatamente 6 dígitos       |

**Exemplo de request:**

```json
{
  "cpf": "12345678901",
  "otp": "483921"
}
```

**Respostas:**

| Status | Corpo                                                                                 | Descrição                                               |
| ------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `200`  | Ver schema abaixo                                                                     | OTP válido — retorna dados do usuário e próximo passo   |
| `400`  | `{ "error": "Nenhum OTP válido encontrado.", "code": "OTP_NOT_FOUND" }`               | Nenhum OTP ativo/válido encontrado para o CPF           |
| `401`  | `{ "error": "Código OTP inválido.", "code": "OTP_INVALID" }`                          | OTP incorreto                                           |
| `404`  | `{ "error": "Usuário não encontrado para o CPF informado", "code": "NOT_FOUND_ERROR" }` | CPF não cadastrado                                    |
| `429`  | `{ "error": "Número máximo de tentativas atingido.", "code": "OTP_MAX_ATTEMPTS" }`    | Limite de 5 tentativas excedido — solicitar novo código |
| `500`  | `{ "error": "Erro interno ao verificar OTP", "code": "INTERNAL_SERVER_ERROR" }`       | Falha interna                                           |

**Schema da resposta 200:**

| Campo       | Tipo                                          | Descrição                                                 |
| ----------- | --------------------------------------------- | --------------------------------------------------------- |
| `verified`  | `boolean`                                     | Sempre `true` em caso de sucesso                          |
| `userId`    | `string` (UUID)                               | ID do usuário autenticado                                 |
| `cpf`       | `string`                                      | CPF normalizado (somente dígitos)                         |
| `name`      | `string \| null`                              | Nome completo do usuário (pode ser nulo)                  |
| `phone`     | `string \| null`                              | Telefone do usuário (pode ser nulo)                       |
| `nextStep`  | `"login" \| "register" \| "entitlement"`      | Próximo passo a ser executado pelo cliente                |

> **Valores de `nextStep`:**
> - `"login"` — usuário possui pagamento ativo; pode fazer login direto.
> - `"register"` — usuário não possui nome cadastrado; deve completar o cadastro.
> - `"entitlement"` — usuário cadastrado mas sem plano ativo; deve adquirir um plano.

**Exemplo de resposta 200:**

```json
{
  "verified": true,
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cpf": "12345678901",
  "name": "João da Silva",
  "phone": "5591999999999",
  "nextStep": "login"
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

**Body (JSON):**

| Campo      | Tipo     | Obrigatório | Descrição                                                              |
| ---------- | -------- | ----------- | ---------------------------------------------------------------------- |
| `telefone` | `string` | ✅          | Número de destino no formato E.164 sem `+` (ex: `5591999999999`)       |
| `mensagem` | `string` | ✅          | Texto da mensagem a ser enviada                                        |

> **Formato E.164:** o número deve conter o código do país (`55` para Brasil) + DDD + número, sem espaços, hífens ou `+`. Exemplo: `5591999999999`.

**Exemplo de request:**

```json
{
  "telefone": "5591999999999",
  "mensagem": "Seu código OTP é: 123456"
}
```

**Respostas:**

| Status | Corpo                                                           | Descrição                                              |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------ |
| `200`  | `{ "sucesso": true, "mensagem": "Enviado com sucesso." }`       | Mensagem enviada com sucesso                           |
| `400`  | `{ "error": "Telefone e mensagem são obrigatórios." }`          | Body incompleto — campos `telefone` ou `mensagem` ausentes |
| `401`  | `{ "error": "Unauthorized", "code": "UNAUTHORIZED" }`           | Token ausente ou inválido no header `x-whatsapp-token` |
| `500`  | `{ "error": "Falha ao enviar mensagem." }`                      | Erro interno ao enviar (ex: falha no WPPConnect)       |
| `503`  | `{ "error": "WhatsApp ainda não está pronto." }`                | Cliente WhatsApp ainda não conectado/autenticado       |

**Exemplo de resposta 200:**

```json
{ "sucesso": true, "mensagem": "Enviado com sucesso." }
```

**Exemplo de resposta 401:**
```json
{ "error": "Unauthorized", "code": "UNAUTHORIZED" }
```

**Exemplo de resposta 503:**
```json
{ "error": "WhatsApp ainda não está pronto." }
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

