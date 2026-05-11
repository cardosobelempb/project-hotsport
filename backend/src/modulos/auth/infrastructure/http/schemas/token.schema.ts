// ============================================================
// token.schema.ts
// Schemas exclusivos da entidade Token.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { TokenType } from "@/common/shared/enums/token-type.enum";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const TokenParamsSchema = z.object({
  tokenId: UuidSchema,
});

export type TokenParams = z.infer<typeof TokenParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const TokenSchema = z
  .object({
    id: UuidSchema,
    userId: UuidSchema,
    type: z.enum(TokenType),
    valueHash: s.hash,
    expiredAt: s.date,
    revokedAt: s.nullableDate,
    ipAddress: s.ipv4,
    userAgent: s.string,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateTokenSchema = TokenSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do TokenSchema base
export const UpdateTokenSchema = TokenSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const TokenResponseSchema = TokenSchema.omit({
  deletedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const TokenSummarySchema = TokenSchema.pick({
  id: true,
  type: true,
  expiredAt: true,
  revokedAt: true,
});

export const TokenAuthSchema = TokenSchema.pick({
  id: true,
  userId: true,
  type: true,
  expiredAt: true,
  revokedAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa TokenResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const TokenCreateResponseSchema =
  createResponseSchema(TokenResponseSchema);
export const TokenFindByIdResponseSchema =
  findResponseSchema(TokenResponseSchema);
export const TokenUpdateResponseSchema =
  updateResponseSchema(TokenResponseSchema);
export const TokenActivateResponseSchema = actionResponseSchema();
export const TokenDeactivateResponseSchema = actionResponseSchema();
export const TokenPageResponseSchema = pageResponseSchema(TokenSummarySchema);
