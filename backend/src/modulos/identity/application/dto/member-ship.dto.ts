// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateMemberShipSchema,
  MemberShipActivateResponseSchema,
  MemberShipCreateResponseSchema,
  MemberShipDeactivateResponseSchema,
  MemberShipFindByIdResponseSchema,
  MemberShipPageResponseSchema,
  MemberShipResponseSchema,
  MemberShipSchema,
  MemberShipSummarySchema,
  MemberShipUpdateResponseSchema,
  UpdateMemberShipSchema,
} from "../schemas/member-ship.schema";

export type MemberShipDto = z.infer<typeof MemberShipSchema>;
export type CreateMemberShipDto = z.infer<typeof CreateMemberShipSchema>;
export type UpdateMemberShipDto = z.infer<typeof UpdateMemberShipSchema>;
export type MemberShipSummaryDto = z.infer<typeof MemberShipSummarySchema>;
export type MemberShipResponseDto = z.infer<typeof MemberShipResponseSchema>;
export type MemberShipCreateResponseDto = z.infer<
  typeof MemberShipCreateResponseSchema
>;
export type MemberShipFindByIdResponseDto = z.infer<
  typeof MemberShipFindByIdResponseSchema
>;
export type MemberShipUpdateResponseDto = z.infer<
  typeof MemberShipUpdateResponseSchema
>;
export type MemberShipActivateResponseDto = z.infer<
  typeof MemberShipActivateResponseSchema
>;
export type MemberShipDeactivateResponseDto = z.infer<
  typeof MemberShipDeactivateResponseSchema
>;
export type MemberShipPageResponseDto = z.infer<
  typeof MemberShipPageResponseSchema
>;
