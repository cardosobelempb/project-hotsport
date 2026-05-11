// ============================================================
// verificationtoken.schema.ts
// Schemas exclusivos da entidade VerificationToken.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { UUIDString } from "@/common/shared/lib/schemas/helpers";
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

export const VerificationTokenParamsSchema = z.object({
  verificationtokenId: UUIDString,
});

export type VerificationTokenParams = z.infer<
  typeof VerificationTokenParamsSchema
>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const VerificationTokenSchema = z
  .object({
    id: UuidSchema,
    identifier: s.string,
    tokenHash: s.token,
    usedAt: s.nullableDate,
    expiredAt: s.date,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateVerificationTokenSchema = VerificationTokenSchema.omit({
  id: true,
  usedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do VerificationTokenSchema base
export const UpdateVerificationTokenSchema = VerificationTokenSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const VerificationTokenResponseSchema = VerificationTokenSchema.omit({});

// Resumo para listagem: versão compacta — evita over-fetching
export const VerificationTokenSummarySchema = VerificationTokenSchema.pick({
  id: true,
  identifier: true,
});

export const VerificationTokenAuthSchema = VerificationTokenSchema.pick({
  id: true,
  identifier: true,
  tokenHash: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa VerificationTokenResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const VerificationTokenCreateResponseSchema = createResponseSchema(
  VerificationTokenResponseSchema,
);
export const VerificationTokenFindByIdResponseSchema = findResponseSchema(
  VerificationTokenResponseSchema,
);
export const VerificationTokenUpdateResponseSchema = updateResponseSchema(
  VerificationTokenResponseSchema,
);
export const VerificationTokenActivateResponseSchema = actionResponseSchema();
export const VerificationTokenDeactivateResponseSchema = actionResponseSchema();
export const VerificationTokenPageResponseSchema = pageResponseSchema(
  VerificationTokenSummarySchema,
);
