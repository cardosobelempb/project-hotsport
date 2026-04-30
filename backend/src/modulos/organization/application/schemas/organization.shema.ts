// ============================================================
// organization.schema.ts
// Schemas exclusivos da entidade Organization.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { ValidatorMessage } from "@/common/domain/validations/validator-message";
import { z } from "zod";

import { OrganizationStatus } from "@/shared/enums/organization-status.enum";
import { IsoDateTimeInput, UUIDSchema } from "@/shared/schemas/helpers";
import { PageSchema } from "@/shared/schemas/pagination-schema";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/shared/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const OrganizationParamsSchema = z.object({
  organizationId: UUIDSchema,
});

export type OrganizationParams = z.infer<typeof OrganizationParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

/**
 * Representa o DTO de apresentação da Organization.
 * Usado como base para todos os schemas de resposta.
 */
export const OrganizationSchema = z
  .object({
    id: UUIDSchema,
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
    status: z.string(),
    createdAt: IsoDateTimeInput,
    updatedAt: IsoDateTimeInput.nullable(),
    deletedAt: IsoDateTimeInput.nullable(),
  })
  .strict();

// ─── Body schemas ─────────────────────────────────────────────────────────────

export const CreateOrganizationSchema = z
  .object({
    name: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    slug: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    logoUrl: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .url(ValidatorMessage.INVALID_URL)
      .nullable(),
    status: z.enum(OrganizationStatus).optional(),
  })
  .strict();

export const UpdateOrganizationSchema =
  CreateOrganizationSchema.partial().strict();

// ─── Response schemas (via factory — sem repetição) ──────────────────────────

const OrganizationWrapper = z.object({ organization: OrganizationSchema });
const OrganizationPageWrapper = OrganizationSchema; // item individual na listagem

export const OrganizationCreateResponse =
  createResponseSchema(OrganizationWrapper);
export const OrganizationFindByIdResponse =
  findResponseSchema(OrganizationWrapper);
export const OrganizationUpdateResponse =
  updateResponseSchema(OrganizationWrapper);
export const OrganizationActivateResponse = actionResponseSchema();
export const OrganizationDeactivateResponse = actionResponseSchema();
export const OrganizationPageResponse = pageResponseSchema(
  OrganizationPageWrapper,
);

export const OrganizationsResponseSchema = PageSchema(CreateOrganizationSchema);
export type OrganizationsResponse = z.infer<typeof OrganizationsResponseSchema>;

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type OrganizationPresenter = z.infer<typeof OrganizationSchema>;
