// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateMembershipSchema,
  MembershipActivateResponseSchema,
  MembershipCreateResponseSchema,
  MembershipDeactivateResponseSchema,
  MembershipFindByIdResponseSchema,
  MembershipPageResponseSchema,
  MembershipResponseSchema,
  MembershipSchema,
  MembershipSummarySchema,
  MembershipUpdateResponseSchema,
  UpdateMembershipSchema,
} from "../../infrastructure/http/schemas/member-ship.schema";

export type MembershipDto = z.infer<typeof MembershipSchema>;
export type CreateMembershipDto = z.infer<typeof CreateMembershipSchema>;
export type UpdateMembershipDto = z.infer<typeof UpdateMembershipSchema>;
export type MembershipSummaryDto = z.infer<typeof MembershipSummarySchema>;
export type MembershipResponseDto = z.infer<typeof MembershipResponseSchema>;
export type MembershipCreateResponseDto = z.infer<
  typeof MembershipCreateResponseSchema
>;
export type MembershipFindByIdResponseDto = z.infer<
  typeof MembershipFindByIdResponseSchema
>;
export type MembershipUpdateResponseDto = z.infer<
  typeof MembershipUpdateResponseSchema
>;
export type MembershipActivateResponseDto = z.infer<
  typeof MembershipActivateResponseSchema
>;
export type MembershipDeactivateResponseDto = z.infer<
  typeof MembershipDeactivateResponseSchema
>;
export type MembershipPageResponseDto = z.infer<
  typeof MembershipPageResponseSchema
>;
