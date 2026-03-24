# 🏗️ Arquitetura do Projeto

## Visão Geral

Este projeto é dividido em dois apps principais com responsabilidades distintas:

```
raiz/
├── backend/     → API principal (Fastify + Prisma + TypeScript)
├── frontend/    → Interface web (React + Vite)
└── docs/        → Documentação técnica do projeto
```

---

## Backend (`backend/`)

### Stack

| Camada           | Tecnologia                                           |
| ---------------- | ---------------------------------------------------- |
| Framework HTTP   | `fastify` v5                                         |
| ORM              | `prisma` v7 + `@prisma/client`                       |
| Banco de dados   | PostgreSQL via `pg`                                  |
| Validação        | `zod` v4 + `fastify-type-provider-zod`               |
| Documentação API | `@fastify/swagger` + `@scalar/fastify-api-reference` |
| Tipagem          | TypeScript 5 (strict)                                |
| Datas            | `dayjs`                                              |
| Variáveis env    | `dotenv`                                             |
| CORS             | `@fastify/cors`                                      |

### Fluxo Principal

```
Requisição HTTP
    │
    ▼
Fastify Route (src/routes/)
    │
    ▼
Zod Schema (validação de entrada)
    │
    ▼
Controller / Handler (src/controllers/)
    │
    ▼
Service (src/services/)  ← lógica de negócio isolada
    │
    ▼
Prisma Client (src/lib/prisma.ts)
    │
    ▼
PostgreSQL
    │
    ▼
Resposta JSON tipada
```

### Integrações Críticas (não quebrar em refactors)

| Integração        | Módulo responsável                                    |
| ----------------- | ----------------------------------------------------- |
| MikroTik RouterOS | `src/services/mikrotikService.ts`                     |
| Mercado Pago      | `src/services/pagamentoService.ts` + webhooks         |
| WhatsApp          | `whatsappServer.ts` (processo separado, porta `3030`) |

> ⚠️ Essas integrações são **domain-critical**. Qualquer refactor deve ser validado end-to-end.

---

## Frontend (`frontend/`)

### Stack

| Camada     | Tecnologia     |
| ---------- | -------------- |
| Framework  | React 18       |
| Build tool | Vite           |
| Entrada    | `src/main.jsx` |

---

## Processos e Portas

| Serviço         | Porta  | Comando                                |
| --------------- | ------ | -------------------------------------- |
| Backend API     | `3001` | `cd backend && npm start`              |
| WhatsApp Server | `3030` | `cd backend && node whatsappServer.js` |
| Frontend Dev    | `5173` | `cd frontend && npm run dev`           |

---

## Diagrama de Dependências

```
[React Frontend]
      │  HTTP (REST)
      ▼
[Fastify API :3001]
      │
      ├─── [PostgreSQL via Prisma]
      ├─── [MikroTik RouterOS API]
      ├─── [Mercado Pago API]
      └─── [WhatsApp Server :3030]
                │
           [WhatsApp Web]
```

---

## Project Hotspot — Decisões de Arquitetura

### Estrutura modular por domínio

O backend é organizado por domínio, seguindo separação em três camadas:

```
backend/src/<dominio>/
├── domain/              → entidades, interfaces, regras de domínio puro
├── application/         → use cases (sem Fastify, sem try/catch)
└── infrastructure/
    ├── controllers/     → 1 controller por endpoint (gera JWT, trata erros)
    └── routes/
        └── <dominio>.router.ts  → 1 router por domínio
```

> Exemplo: `backend/src/auth/infrastructure/controllers/LoginController.ts`

### Responsabilidades por camada

| Camada             | Responsabilidade                                       | Proibido                         |
| ------------------ | ------------------------------------------------------ | -------------------------------- |
| `domain/`          | Entidades e regras de negócio puras                    | Imports de infra/Fastify/Prisma  |
| `application/`     | Use cases — lógica de negócio + OutputDto              | `try/catch`, retornar model ORM  |
| `infrastructure/`  | Controllers + rotas + JWT + tratamento de erros        | Regras de negócio                |

### JWT

- O **JWT é gerado no controller** (camada de infra).
- Os **use cases não geram JWT** — devolvem apenas dados de domínio.
- Payload mínimo recomendado: `{ sub: user.id, role: user.role }`.

### Tratamento de Erros

- Use cases lançam erros customizados de `src/errors/index.ts` (ex: `AppError`, `NotFoundError`).
- Controllers capturam esses erros com `try/catch` e retornam JSON no formato:

```json
{ "error": "mensagem", "code": "CODIGO_DO_ERRO" }
```

- **Nunca** retorne stack traces ou detalhes internos ao cliente.

### Comunicação com MikroTiks (VPN)

- A comunicação entre o servidor central e os MikroTiks é feita via **VPN** (WireGuard recomendado).
- A VPN garante que portas sensíveis (RADIUS 1812/1813, API RouterOS 8728/8729) não fiquem expostas na internet.
- Cada MikroTik conecta como peer VPN ao servidor central.
