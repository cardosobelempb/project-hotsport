// ============================================================
// membership.schema.ts
// Schemas exclusivos da entidade MemberShip.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { MemberShipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MemberShipStatus } from "@/common/shared/enums/member-ship-status.enum";
import {
  IsoDateTimeInput,
  UUIDString,
} from "@/common/shared/lib/schemas/helpers";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const MemberShipParamsSchema = z.object({
  membershipId: UUIDString,
});

export type MemberShipParams = z.infer<typeof MemberShipParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const MemberShipSchema = z
  .object({
    id: UUIDString,
    userId: UUIDString,
    tenantId: UUIDString,
    organizationId: UUIDString.nullable(),
    role: z.enum(MemberShipRole).default(MemberShipRole.MEMBER),
    status: z.enum(MemberShipStatus).default(MemberShipStatus.ACTIVE),
    joinedAt: IsoDateTimeInput.optional().nullable(),
    invitedEmail: z.string().email().nullable(),
    invitedById: UUIDString.nullable(),
    expiresAt: IsoDateTimeInput.optional().nullable(),
    removedAt: IsoDateTimeInput.optional().nullable(),
    cretedAt: IsoDateTimeInput.optional(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateMemberShipSchema = MemberShipSchema.omit({
  id: true,
  joinedAt: true,
  removedAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do MemberShipSchema base
export const UpdateMemberShipSchema = MemberShipSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const MemberShipResponseSchema = MemberShipSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const MemberShipSummarySchema = MemberShipSchema.pick({
  id: true,
  userId: true,
  tenantId: true,
  organizationId: true,
  role: true,
  status: true,
  joinedAt: true,
  invitedEmail: true,
  invitedById: true,
  expiresAt: true,
  removedAt: true,
  cretedAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa MemberShipResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const MemberShipCreateResponseSchema = createResponseSchema(
  MemberShipResponseSchema,
);
export const MemberShipFindByIdResponseSchema = findResponseSchema(
  MemberShipResponseSchema,
);
export const MemberShipUpdateResponseSchema = updateResponseSchema(
  MemberShipResponseSchema,
);
export const MemberShipActivateResponseSchema = actionResponseSchema();
export const MemberShipDeactivateResponseSchema = actionResponseSchema();
export const MemberShipPageResponseSchema = pageResponseSchema(
  MemberShipSummarySchema,
);
