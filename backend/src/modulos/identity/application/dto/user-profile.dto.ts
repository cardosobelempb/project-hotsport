// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateUserProfileSchema,
  UpdateUserProfileSchema,
  UserProfileActivateResponseSchema,
  UserProfileCreateResponseSchema,
  UserProfileDeactivateResponseSchema,
  UserProfileFindByIdResponseSchema,
  UserProfilePageResponseSchema,
  UserProfileResponseSchema,
  UserProfileSchema,
  UserProfileSummarySchema,
  UserProfileUpdateResponseSchema,
} from "../schemas/user-profile.schema";

export type UserProfileDto = z.infer<typeof UserProfileSchema>;
export type CreateUserProfileDto = z.infer<typeof CreateUserProfileSchema>;
export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileSchema>;
export type UserProfileSummaryDto = z.infer<typeof UserProfileSummarySchema>;
export type UserProfileResponseDto = z.infer<typeof UserProfileResponseSchema>;
export type UserProfileCreateResponseDto = z.infer<
  typeof UserProfileCreateResponseSchema
>;
export type UserProfileFindByIdResponseDto = z.infer<
  typeof UserProfileFindByIdResponseSchema
>;
export type UserProfileUpdateResponseDto = z.infer<
  typeof UserProfileUpdateResponseSchema
>;
export type UserProfileActivateResponseDto = z.infer<
  typeof UserProfileActivateResponseSchema
>;
export type UserProfileDeactivateResponseDto = z.infer<
  typeof UserProfileDeactivateResponseSchema
>;
export type UserProfilePageResponseDto = z.infer<
  typeof UserProfilePageResponseSchema
>;
