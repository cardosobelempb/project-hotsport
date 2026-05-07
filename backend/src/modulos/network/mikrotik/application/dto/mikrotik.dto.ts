// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateMikrotikSchema,
  MikrotikActivateResponseSchema,
  MikrotikCreateResponseSchema,
  MikrotikDeactivateResponseSchema,
  MikrotikFindByIdResponseSchema,
  MikrotikPageResponseSchema,
  MikrotikResponseSchema,
  MikrotikSchema,
  MikrotikSummarySchema,
  MikrotikUpdateResponseSchema,
  UpdateMikrotikSchema,
} from "../schema/mikrotik.schema";

export type MikrotikDto = z.infer<typeof MikrotikSchema>;
export type CreateMikrotikDto = z.infer<typeof CreateMikrotikSchema>;
export type UpdateMikrotikDto = z.infer<typeof UpdateMikrotikSchema>;
export type MikrotikSummaryDto = z.infer<typeof MikrotikSummarySchema>;
export type MikrotikResponseDto = z.infer<typeof MikrotikResponseSchema>;
export type MikrotikCreateResponseDto = z.infer<
  typeof MikrotikCreateResponseSchema
>;
export type MikrotikFindByIdResponseDto = z.infer<
  typeof MikrotikFindByIdResponseSchema
>;
export type MikrotikUpdateResponseDto = z.infer<
  typeof MikrotikUpdateResponseSchema
>;
export type MikrotikActivateResponseDto = z.infer<
  typeof MikrotikActivateResponseSchema
>;
export type MikrotikDeactivateResponseDto = z.infer<
  typeof MikrotikDeactivateResponseSchema
>;
export type MikrotikPageResponseDto = z.infer<
  typeof MikrotikPageResponseSchema
>;
