// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateVoucherSchema,
  UpdateVoucherSchema,
  VoucherActivateResponseSchema,
  VoucherCreateResponseSchema,
  VoucherDeactivateResponseSchema,
  VoucherFindByIdResponseSchema,
  VoucherPageResponseSchema,
  VoucherResponseSchema,
  VoucherSchema,
  VoucherSummarySchema,
  VoucherUpdateResponseSchema,
} from "../schemas/voucher.shema";

export type VoucherDto = z.infer<typeof VoucherSchema>;
export type CreateVoucherDto = z.infer<typeof CreateVoucherSchema>;
export type UpdateVoucherDto = z.infer<typeof UpdateVoucherSchema>;
export type VoucherSummaryDto = z.infer<typeof VoucherSummarySchema>;
export type VoucherResponseDto = z.infer<typeof VoucherResponseSchema>;
export type VoucherCreateResponseDto = z.infer<
  typeof VoucherCreateResponseSchema
>;
export type VoucherFindByIdResponseDto = z.infer<
  typeof VoucherFindByIdResponseSchema
>;
export type VoucherUpdateResponseDto = z.infer<
  typeof VoucherUpdateResponseSchema
>;
export type VoucherActivateResponseDto = z.infer<
  typeof VoucherActivateResponseSchema
>;
export type VoucherDeactivateResponseDto = z.infer<
  typeof VoucherDeactivateResponseSchema
>;
export type VoucherPageResponseDto = z.infer<typeof VoucherPageResponseSchema>;
