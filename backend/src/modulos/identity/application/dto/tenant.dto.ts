// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateTenantSchema,
  TenantActivateResponseSchema,
  TenantCreateResponseSchema,
  TenantDeactivateResponseSchema,
  TenantFindByIdResponseSchema,
  TenantPageResponseSchema,
  TenantResponseSchema,
  TenantSchema,
  TenantSummarySchema,
  TenantUpdateResponseSchema,
  UpdateTenantSchema,
} from "../../infrastructure/http/schemas/tenant.schema";

export type TenantDto = z.infer<typeof TenantSchema>;
export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
export type TenantSummaryDto = z.infer<typeof TenantSummarySchema>;
export type TenantResponseDto = z.infer<typeof TenantResponseSchema>;
export type TenantCreateResponseDto = z.infer<
  typeof TenantCreateResponseSchema
>;
export type TenantFindByIdResponseDto = z.infer<
  typeof TenantFindByIdResponseSchema
>;
export type TenantUpdateResponseDto = z.infer<
  typeof TenantUpdateResponseSchema
>;
export type TenantActivateResponseDto = z.infer<
  typeof TenantActivateResponseSchema
>;
export type TenantDeactivateResponseDto = z.infer<
  typeof TenantDeactivateResponseSchema
>;
export type TenantPageResponseDto = z.infer<typeof TenantPageResponseSchema>;
