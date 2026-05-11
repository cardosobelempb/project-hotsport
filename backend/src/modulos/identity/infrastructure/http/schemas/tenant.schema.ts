// ============================================================
// tenant.schema.ts
// Schemas exclusivos da entidade Tenant.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { TenantStatus } from "@/common/shared/enums/tenant-atatus.enum";
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

export const TenantParamsSchema = z.object({
  tenantId: UUIDString,
});

export type TenantParams = z.infer<typeof TenantParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const TenantSchema = z
  .object({
    id: UuidSchema,
    name: s.name,
    slug: s.slug,
    documentNumber: s.string,
    contactEmail: s.email,
    phone: s.phone,
    status: z.enum(TenantStatus),
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do TenantSchema base
export const UpdateTenantSchema = TenantSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const TenantResponseSchema = TenantSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const TenantSummarySchema = TenantSchema.pick({
  id: true,
  name: true,
  slug: true,
  contactEmail: true,
  phone: true,
  status: true,
});

export const TenantAuthSchema = TenantSchema.pick({
  id: true,
  name: true,
  slug: true,
  contactEmail: true,
  phone: true,
  status: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa TenantResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const TenantCreateResponseSchema =
  createResponseSchema(TenantResponseSchema);
export const TenantFindByIdResponseSchema =
  findResponseSchema(TenantResponseSchema);
export const TenantUpdateResponseSchema =
  updateResponseSchema(TenantResponseSchema);
export const TenantActivateResponseSchema = actionResponseSchema();
export const TenantDeactivateResponseSchema = actionResponseSchema();
export const TenantPageResponseSchema = pageResponseSchema(TenantSummarySchema);
