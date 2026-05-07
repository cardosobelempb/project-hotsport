// ============================================================
// organization.schema.ts
// Schemas exclusivos da entidade Organization.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";
import { DocumentType } from "@/common/shared/enums/document-type.enum";
import { OrganizationStatus } from "@/common/shared/enums/organization-status.enum";
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
    id: UUIDString,
    tenantId: UUIDString.nullable(),
    name: z.string(ValidatorMessage.REQUIRED_FIELD),
    slug: z.string(ValidatorMessage.REQUIRED_FIELD),
    documentType: z.enum(DocumentType).nullable(),
    documentNumber: z.string().nullable(),
    contactEmail: z.email(ValidatorMessage.REQUIRED_EMAIL).nullable(),
    phone: z.string().nullable(),
    logoUrl: z.url(ValidatorMessage.INVALID_FORMAT).nullable(),
    status: z.enum(OrganizationStatus).default(OrganizationStatus.ACTIVE),
    createdAt: IsoDateTimeInput.optional(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  tenantId: true,
  contactEmail: true,
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
