// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateLgpdConsentsSchema,
  LgpdConsentsActivateResponseSchema,
  LgpdConsentsCreateResponseSchema,
  LgpdConsentsDeactivateResponseSchema,
  LgpdConsentsFindByIdResponseSchema,
  LgpdConsentsPageResponseSchema,
  LgpdConsentsResponseSchema,
  LgpdConsentsSchema,
  LgpdConsentsSummarySchema,
  LgpdConsentsUpdateResponseSchema,
  UpdateLgpdConsentsSchema,
} from "../../infrastructure/http/schemas/lgpd-consents.schema";

export type LgpdConsentsDto = z.infer<typeof LgpdConsentsSchema>;
export type CreateLgpdConsentsDto = z.infer<typeof CreateLgpdConsentsSchema>;
export type UpdateLgpdConsentsDto = z.infer<typeof UpdateLgpdConsentsSchema>;
export type LgpdConsentsSummaryDto = z.infer<typeof LgpdConsentsSummarySchema>;
export type LgpdConsentsResponseDto = z.infer<
  typeof LgpdConsentsResponseSchema
>;
export type LgpdConsentsCreateResponseDto = z.infer<
  typeof LgpdConsentsCreateResponseSchema
>;
export type LgpdConsentsFindByIdResponseDto = z.infer<
  typeof LgpdConsentsFindByIdResponseSchema
>;
export type LgpdConsentsUpdateResponseDto = z.infer<
  typeof LgpdConsentsUpdateResponseSchema
>;
export type LgpdConsentsActivateResponseDto = z.infer<
  typeof LgpdConsentsActivateResponseSchema
>;
export type LgpdConsentsDeactivateResponseDto = z.infer<
  typeof LgpdConsentsDeactivateResponseSchema
>;
export type LgpdConsentsPageResponseDto = z.infer<
  typeof LgpdConsentsPageResponseSchema
>;
