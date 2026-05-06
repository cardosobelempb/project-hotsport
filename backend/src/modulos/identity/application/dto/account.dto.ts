import z from "zod";
import {
  AccountActivateResponseSchema,
  AccountCreateResponseSchema,
  AccountDeactivateResponseSchema,
  AccountFindByIdResponseSchema,
  AccountPageResponseSchema,
  AccountResponseSchema,
  AccountSchema,
  AccountSummarySchema,
  AccountUpdateResponseSchema,
  CreateAccountSchema,
  UpdateAccountSchema,
} from "../schemas/account.shema";

export type AccountDto = z.infer<typeof AccountSchema>;
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
export type AccountSummaryDto = z.infer<typeof AccountSummarySchema>;
export type AccountResponseDto = z.infer<typeof AccountResponseSchema>;
export type AccountCreateResponseDto = z.infer<
  typeof AccountCreateResponseSchema
>;
export type AccountFindByIdResponseDto = z.infer<
  typeof AccountFindByIdResponseSchema
>;
export type AccountUpdateResponseDto = z.infer<
  typeof AccountUpdateResponseSchema
>;
export type AccountActivateResponseDto = z.infer<
  typeof AccountActivateResponseSchema
>;
export type AccountDeactivateResponseDto = z.infer<
  typeof AccountDeactivateResponseSchema
>;
export type AccountPageResponseDto = z.infer<typeof AccountPageResponseSchema>;
