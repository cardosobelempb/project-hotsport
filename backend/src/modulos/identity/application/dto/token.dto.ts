// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateOrganizationSchema,
  OrganizationActivateResponseSchema,
  OrganizationCreateResponseSchema,
  OrganizationDeactivateResponseSchema,
  OrganizationFindByIdResponseSchema,
  OrganizationPageResponseSchema,
  OrganizationResponseSchema,
  OrganizationSchema,
  OrganizationSummarySchema,
  OrganizationUpdateResponseSchema,
  UpdateOrganizationSchema,
} from "../../infrastructure/http/schemas/organization.schema";

export type OrganizationDto = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
export type OrganizationSummaryDto = z.infer<typeof OrganizationSummarySchema>;
export type OrganizationResponseDto = z.infer<
  typeof OrganizationResponseSchema
>;
export type OrganizationCreateResponseDto = z.infer<
  typeof OrganizationCreateResponseSchema
>;
export type OrganizationFindByIdResponseDto = z.infer<
  typeof OrganizationFindByIdResponseSchema
>;
export type OrganizationUpdateResponseDto = z.infer<
  typeof OrganizationUpdateResponseSchema
>;
export type OrganizationActivateResponseDto = z.infer<
  typeof OrganizationActivateResponseSchema
>;
export type OrganizationDeactivateResponseDto = z.infer<
  typeof OrganizationDeactivateResponseSchema
>;
export type OrganizationPageResponseDto = z.infer<
  typeof OrganizationPageResponseSchema
>;
