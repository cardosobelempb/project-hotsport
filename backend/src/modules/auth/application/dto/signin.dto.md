// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";

export type SigninDto = z.infer<typeof SigninSchema>;
export type SigninBodyDto = z.infer<typeof SigninBodySchema>;
export type CreateSigninDto = z.infer<typeof CreateSigninSchema>;
export type UpdateSigninDto = z.infer<typeof UpdateSigninSchema>;
export type SigninSummaryDto = z.infer<typeof SigninSummarySchema>;
export type SigninResponseDto = z.infer<typeof SigninResponseSchema>;
export type SigninCreateResponseDto = z.infer<
  typeof SigninCreateResponseSchema
>;
export type SigninFindByIdResponseDto = z.infer<
  typeof SigninFindByIdResponseSchema
>;
export type SigninUpdateResponseDto = z.infer<
  typeof SigninUpdateResponseSchema
>;
export type SigninActivateResponseDto = z.infer<
  typeof SigninActivateResponseSchema
>;
export type SigninDeactivateResponseDto = z.infer<
  typeof SigninDeactivateResponseSchema
>;
export type SigninPageResponseDto = z.infer<typeof SigninPageResponseSchema>;
