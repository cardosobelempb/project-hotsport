// ============================================================
// user.schema.ts
// Schemas exclusivos da entidade User.
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

// ─── Params ───────────────────────────────────────────────────────────────────

export const SessionParamsSchema = z.object({
  sessionId: UUIDString,
});

export type SessionParams = z.infer<typeof SessionParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const SessionSchema = z
  .object({
    id: s.uuid,
    sessionToken: s.token,
    userId: s.uuid,
    ipAddress: s.ipv4.optional(),
    userAgent: s.string.optional(),
    expiredAt: s.date,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateSessionSchema = SessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do SessionSchema base
export const UpdateSessionSchema = SessionSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const SessionResponseSchema = SessionSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const SessionSummarySchema = SessionSchema.pick({
  id: true,
  userId: true,
  expiredAt: true,
});

export const SessionAuthSchema = SessionSchema.pick({
  id: true,
  sessionToken: true,
  userId: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa SessionResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const SessionCreateResponseSchema = createResponseSchema(
  SessionResponseSchema,
);
export const SessionFindByIdResponseSchema = findResponseSchema(
  SessionResponseSchema,
);
export const SessionUpdateResponseSchema = updateResponseSchema(
  SessionResponseSchema,
);
export const SessionActivateResponseSchema = actionResponseSchema();
export const SessionDeactivateResponseSchema = actionResponseSchema();
export const SessionPageResponseSchema =
  pageResponseSchema(SessionSummarySchema);
