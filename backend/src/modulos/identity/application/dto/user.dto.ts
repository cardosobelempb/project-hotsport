// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserActivateResponseSchema,
  UserCreateResponseSchema,
  UserDeactivateResponseSchema,
  UserFindByIdResponseSchema,
  UserPageResponseSchema,
  UserResponseSchema,
  UserSchema,
  UserSummarySchema,
  UserUpdateResponseSchema,
} from "../schemas/user.schema";

export type UserDto = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserSummaryDto = z.infer<typeof UserSummarySchema>;
export type UserResponseDto = z.infer<typeof UserResponseSchema>;
export type UserCreateResponseDto = z.infer<typeof UserCreateResponseSchema>;
export type UserFindByIdResponseDto = z.infer<
  typeof UserFindByIdResponseSchema
>;
export type UserUpdateResponseDto = z.infer<typeof UserUpdateResponseSchema>;
export type UserActivateResponseDto = z.infer<
  typeof UserActivateResponseSchema
>;
export type UserDeactivateResponseDto = z.infer<
  typeof UserDeactivateResponseSchema
>;
export type UserPageResponseDto = z.infer<typeof UserPageResponseSchema>;
