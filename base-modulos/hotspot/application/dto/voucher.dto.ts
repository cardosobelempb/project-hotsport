// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  VoucherPageResponseSchema,
  VoucherResponseSchema,
  VoucherSchema,
  VoucherSummarySchema,
} from "../schemas/voucher.shema";

export type VoucherDto = z.infer<typeof VoucherSchema>;
export type VoucherSummaryDto = z.infer<typeof VoucherSummarySchema>;
export type VoucherResponseDto = z.infer<typeof VoucherResponseSchema>;
export type VoucherPageResponseDto = z.infer<typeof VoucherPageResponseSchema>;
