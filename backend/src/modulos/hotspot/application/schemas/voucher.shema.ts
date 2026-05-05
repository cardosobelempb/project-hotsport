// ============================================================
// voucher.schema.ts
// Schemas exclusivos da entidade Voucher.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { EntityStatus } from "@/common/shared/enums/entity-status.enum";

import { IsoDateTimeInput, UUIDString } from "@/common/shared/schemas/helpers";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const VoucherParamsSchema = z.object({
  voucherId: UUIDString,
});

export type VoucherParams = z.infer<typeof VoucherParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const VoucherSchema = z
  .object({
    id: UUIDString,
    organizationId: UUIDString,
    mikrotikId: UUIDString.nullable(),
    hotspotPlanId: UUIDString.nullable(),
    code: z.string().max(50),
    status: z.enum(EntityStatus).default(EntityStatus.ACTIVE),
    usedAt: IsoDateTimeInput.nullable(),
    expiresAt: IsoDateTimeInput.nullable(),
    createdAt: IsoDateTimeInput,
    updatedAt: IsoDateTimeInput.nullable(),
    deletedAt: IsoDateTimeInput.nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateVoucherSchema = VoucherSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do VoucherSchema base
export const UpdateVoucherSchema = VoucherSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const VoucherResponseSchema = VoucherSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const VoucherSummarySchema = VoucherSchema.pick({
  id: true,
  code: true,
  status: true,
  expiresAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa VoucherResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const VoucherCreateResponseSchema = createResponseSchema(
  VoucherResponseSchema,
);
export const VoucherFindByIdResponseSchema = findResponseSchema(
  VoucherResponseSchema,
);
export const VoucherUpdateResponseSchema = updateResponseSchema(
  VoucherResponseSchema,
);
export const VoucherActivateResponseSchema = actionResponseSchema();
export const VoucherDeactivateResponseSchema = actionResponseSchema();
export const VoucherPageResponseSchema =
  pageResponseSchema(VoucherSummarySchema);
