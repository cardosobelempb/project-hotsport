// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateRegisterSchema,
  RegisterActivateResponseSchema,
  RegisterCreateResponseSchema,
  RegisterDeactivateResponseSchema,
  RegisterFindByIdResponseSchema,
  RegisterPageResponseSchema,
  RegisterResponseSchema,
  RegisterSchema,
  RegisterSummarySchema,
  RegisterUpdateResponseSchema,
  UpdateRegisterSchema,
} from "../../infrastructure/http/schemas/register.schema";

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type CreateRegisterDto = z.infer<typeof CreateRegisterSchema>;
export type UpdateRegisterDto = z.infer<typeof UpdateRegisterSchema>;
export type RegisterSummaryDto = z.infer<typeof RegisterSummarySchema>;
export type RegisterResponseDto = z.infer<typeof RegisterResponseSchema>;
export type RegisterCreateResponseDto = z.infer<
  typeof RegisterCreateResponseSchema
>;
export type RegisterFindByIdResponseDto = z.infer<
  typeof RegisterFindByIdResponseSchema
>;
export type RegisterUpdateResponseDto = z.infer<
  typeof RegisterUpdateResponseSchema
>;
export type RegisterActivateResponseDto = z.infer<
  typeof RegisterActivateResponseSchema
>;
export type RegisterDeactivateResponseDto = z.infer<
  typeof RegisterDeactivateResponseSchema
>;
export type RegisterPageResponseDto = z.infer<
  typeof RegisterPageResponseSchema
>;
