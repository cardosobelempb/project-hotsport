// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateLgpdConsentsSchema,
  LgpdConsentsCreateResponseSchema,
  LgpdConsentsResponseSchema,
  LgpdConsentsSummarySchema,
  UpdateLgpdConsentsSchema,
} from "../../infrastructure/http/schemas/lgpd-consents.schema";

export type LgpdConsentsDto = z.infer<typeof LgpdConsentsSummarySchema>;
export type CreateLgpdConsentsDto = z.infer<typeof CreateLgpdConsentsSchema>;
export type UpdateLgpdConsentsDto = z.infer<typeof UpdateLgpdConsentsSchema>;
export type LgpdConsentsSummaryDto = z.infer<typeof LgpdConsentsSummarySchema>;
export type LgpdConsentsResponseDto = z.infer<
  typeof LgpdConsentsResponseSchema
>;
export type LgpdConsentsCreateResponseDto = z.infer<
  typeof LgpdConsentsCreateResponseSchema
>;
