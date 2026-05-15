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

export const MembershipParamsSchema = z.object({
  membershipId: UUIDString,
});

export type MembershipParams = z.infer<typeof MembershipParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const MembershipSchema = z
  .object({
    id: s.uuid,
    userId: s.uuid,
    tenantId: s.uuid,
    organizationId: s.uuid,
    invitedById: s.uuid,
    invitedEmail: s.email,
    role: s.string,
    status: s.string,
    joinedAt: s.nullableDate,
    removedAt: s.nullableDate,
    expiredAt: s.nullableDate,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateMembershipSchema = MembershipSchema.omit({
  id: true,
  joinedAt: true,
  removedAt: true,
  expiredAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do MembershipSchema base
export const UpdateMembershipSchema = MembershipSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const MembershipResponseSchema = MembershipSchema.omit({
  deletedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const MembershipSummarySchema = MembershipSchema.pick({
  id: true,
  tenantId: true,
  organizationId: true,
  role: true,
  status: true,
});

export const MembershipAuthSchema = MembershipSchema.pick({
  id: true,
  userId: true,
  tenantId: true,
  organizationId: true,
  role: true,
  status: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa MembershipResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const MembershipCreateResponseSchema = createResponseSchema(
  MembershipResponseSchema,
);
export const MembershipFindByIdResponseSchema = findResponseSchema(
  MembershipResponseSchema,
);
export const MembershipUpdateResponseSchema = updateResponseSchema(
  MembershipResponseSchema,
);
export const MembershipActivateResponseSchema = actionResponseSchema();
export const MembershipDeactivateResponseSchema = actionResponseSchema();
export const MembershipPageResponseSchema = pageResponseSchema(
  MembershipSummarySchema,
);
