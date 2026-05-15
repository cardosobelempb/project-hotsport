// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateVerificationTokenSchema,
  UpdateVerificationTokenSchema,
  VerificationTokenActivateResponseSchema,
  VerificationTokenCreateResponseSchema,
  VerificationTokenDeactivateResponseSchema,
  VerificationTokenFindByIdResponseSchema,
  VerificationTokenPageResponseSchema,
  VerificationTokenResponseSchema,
  VerificationTokenSchema,
  VerificationTokenSummarySchema,
  VerificationTokenUpdateResponseSchema,
} from "../../infrastructure/http/schemas/verification-token.schema";

export type VerificationTokenDto = z.infer<typeof VerificationTokenSchema>;
export type CreateVerificationTokenDto = z.infer<
  typeof CreateVerificationTokenSchema
>;
export type UpdateVerificationTokenDto = z.infer<
  typeof UpdateVerificationTokenSchema
>;
export type VerificationTokenSummaryDto = z.infer<
  typeof VerificationTokenSummarySchema
>;
export type VerificationTokenResponseDto = z.infer<
  typeof VerificationTokenResponseSchema
>;
export type VerificationTokenCreateResponseDto = z.infer<
  typeof VerificationTokenCreateResponseSchema
>;
export type VerificationTokenFindByIdResponseDto = z.infer<
  typeof VerificationTokenFindByIdResponseSchema
>;
export type VerificationTokenUpdateResponseDto = z.infer<
  typeof VerificationTokenUpdateResponseSchema
>;
export type VerificationTokenActivateResponseDto = z.infer<
  typeof VerificationTokenActivateResponseSchema
>;
export type VerificationTokenDeactivateResponseDto = z.infer<
  typeof VerificationTokenDeactivateResponseSchema
>;
export type VerificationTokenPageResponseDto = z.infer<
  typeof VerificationTokenPageResponseSchema
>;
