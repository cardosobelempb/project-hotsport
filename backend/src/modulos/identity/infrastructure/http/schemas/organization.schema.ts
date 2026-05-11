// ============================================================
// organization.schema.ts
// Schemas exclusivos da entidade Organization.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { OrganizationStatus } from "@/common/shared/enums/organization-status-scope.enum";
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

export const OrganizationParamsSchema = z.object({
  organizationId: UUIDString,
});

export type OrganizationParams = z.infer<typeof OrganizationParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const OrganizationSchema = z
  .object({
    id: s.uuid,
    tenantId: s.uuid,
    name: s.name,
    slug: s.slug,
    logoUrl: s.url,
    status: z.enum(OrganizationStatus),
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do OrganizationSchema base
export const UpdateOrganizationSchema = OrganizationSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const OrganizationResponseSchema = OrganizationSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const OrganizationSummarySchema = OrganizationSchema.pick({
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  status: true,
});

export const OrganizationAuthSchema = OrganizationSchema.pick({
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  status: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa OrganizationResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const OrganizationCreateResponseSchema = createResponseSchema(
  OrganizationResponseSchema,
);
export const OrganizationFindByIdResponseSchema = findResponseSchema(
  OrganizationResponseSchema,
);
export const OrganizationUpdateResponseSchema = updateResponseSchema(
  OrganizationResponseSchema,
);
export const OrganizationActivateResponseSchema = actionResponseSchema();
export const OrganizationDeactivateResponseSchema = actionResponseSchema();
export const OrganizationPageResponseSchema = pageResponseSchema(
  OrganizationSummarySchema,
);
