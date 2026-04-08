# Schema Zod

Crie um novo schema Zod seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

---

## Requisitos obrigatórios

- Arquivo em `{modulo}/infrastructure/schemas/` com nome `{modulo}.schema.ts` (kebab-case)
- Schemas compartilhados (erros, DTOs) em `shared/schemas/`
- Tipos inferidos com `z.infer<typeof Schema>` — nunca definir interfaces manualmente
- `ResponseSchema` sempre como objeto com chaves por status HTTP (`200`, `401`, `500`)
- Importar `ErrorSchema` de `shared/schemas/error-response.schema.ts`
- Importar `{Entidade}DTOSchema` de `shared/schemas/{entidade}-dto.schema.ts` quando necessário
- NUNCA duplicar schemas de erro — sempre importar do shared
- NUNCA usar `z.date()` no response — usar `z.string().datetime()`
- NUNCA criar `BaseSchema` + `.extend({})` sem adicionar campos

---

## Estrutura obrigatória

```typescript
// {modulo}.schema.ts

import { z } from "zod";
import { ErrorSchema } from "@/shared/schemas/error-response.schema";

// ── Body ─────────────────────────────────────────────────────────────────────

export const {Modulo}{Acao}BodySchema = z.object({
  // campos de entrada
});

export type {Modulo}{Acao}BodyType = z.infer<typeof {Modulo}{Acao}BodySchema>;

// ── Response ──────────────────────────────────────────────────────────────────

export const {Modulo}{Acao}ResponseSchema = {
  200: z.object({
    // campos de saída
  }),
  401: ErrorSchema,
  500: ErrorSchema,
};

export type {Modulo}{Acao}ResponseType = z.infer<
  typeof {Modulo}{Acao}ResponseSchema[200]
>;
```

---

## Schemas compartilhados

### `shared/schemas/error-response.schema.ts`

```typescript
import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
  path: z.string(),
  error: z.string()
});

export type ErrorResponseType = z.infer<typeof ErrorResponseSchema>;
```

### `shared/schemas/{entidade}-dto.schema.ts`

```typescript
import { z } from "zod";

export const {Entidade}DTOSchema = z.object({
  id: z.string().uuid(),
  // demais campos como primitivos
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type {Entidade}DTOType = z.infer<typeof {Entidade}DTOSchema>;
```

---

## Referência de tipos Zod

| Dado            | Zod correto             | Evitar       |
| --------------- | ----------------------- | ------------ |
| UUID            | `z.string().uuid()`     | `z.string()` |
| E-mail          | `z.string().email()`    | `z.string()` |
| Data (response) | `z.string().datetime()` | `z.date()`   |
| Senha           | `z.string().min(6)`     | `z.string()` |
| Enum            | `z.enum(["a", "b"])`    | `z.string()` |
| Opcional        | `z.string().optional()` | `z.string()` |
| Nullable        | `z.string().nullable()` | `z.string()` |

---

## Exemplo

<!-- Adicione aqui um schema real do projeto como referência -->

```typescript
import z from 'zod';

import { UserResponseSchema } from '@/modulos/user/infrastructure/schemas/user.schema';
import { ErrorSchema } from '@/shared/schemas/error';

export const AuthSessionResponseSchema = {
  200: z.object({ user: UserResponseSchema }),
  401: ErrorSchema,
  500: ErrorSchema
};

export type AuthSessionResponseType = z.infer<
  (typeof AuthSessionResponseSchema)[200]
>;
```

---

## Perguntas

Se as informações não forem fornecidas, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é a **ação**? (ex: `login`, `create`, `delete`)
3. Quais são os **campos do body**? (nome, tipo e se é obrigatório)
4. Quais são os **campos do response 200**? (nome e tipo)
5. Quais **status de erro** são possíveis? (ex: `401`, `404`, `409`, `500`)
