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
