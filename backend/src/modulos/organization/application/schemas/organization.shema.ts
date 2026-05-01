// ============================================================
// organization.schema.ts
// Schemas exclusivos da entidade Organization.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { ValidatorMessage } from "@/common/domain/validations/validator-message";
import { z } from "zod";

import { OrganizationStatus } from "@/shared/enums/organization-status.enum";
import { IsoDateTimeOutput, UUIDSchema } from "@/shared/schemas/helpers";
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

// ─── Schema resumido para listagem paginada ───────────────────────────────────
export const OrganizationSummarySchema = z
  .object({
    id: UUIDSchema,
    name: z.string(),
    slug: z.string(),
    status: z.string(),
    // totalMembers: z.number().int().nonnegative(), // ✅ campo exclusivo da listagem
    createdAt: IsoDateTimeOutput,
    // updatedAt: IsoDateTimeOutput.nullable(),
  })
  .strict();

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
    createdAt: IsoDateTimeOutput,
    updatedAt: IsoDateTimeOutput.nullable(),
    deletedAt: IsoDateTimeOutput.nullable(),
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

const OrganizationWrapper = z.object(OrganizationSchema);
const OrganizationPageWrapper = OrganizationSummarySchema; // item individual na listagem

export const OrganizationCreateResponse =
  createResponseSchema(OrganizationSchema);
export const OrganizationFindByIdResponse =
  findResponseSchema(OrganizationWrapper);
export const OrganizationUpdateResponse =
  updateResponseSchema(OrganizationWrapper);
export const OrganizationActivateResponse = actionResponseSchema();
export const OrganizationDeactivateResponse = actionResponseSchema();
export const OrganizationPageResponse = pageResponseSchema(
  OrganizationPageWrapper,
);

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type OrganizationPresenter = z.infer<typeof OrganizationSchema>;
