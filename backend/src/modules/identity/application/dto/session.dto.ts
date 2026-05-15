// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  CreateSessionSchema,
  SessionActivateResponseSchema,
  SessionCreateResponseSchema,
  SessionDeactivateResponseSchema,
  SessionFindByIdResponseSchema,
  SessionPageResponseSchema,
  SessionResponseSchema,
  SessionSchema,
  SessionSummarySchema,
  SessionUpdateResponseSchema,
  UpdateSessionSchema,
} from "../../infrastructure/http/schemas/session.schema";

export type SessionDto = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
export type SessionSummaryDto = z.infer<typeof SessionSummarySchema>;
export type SessionResponseDto = z.infer<typeof SessionResponseSchema>;
export type SessionCreateResponseDto = z.infer<
  typeof SessionCreateResponseSchema
>;
export type SessionFindByIdResponseDto = z.infer<
  typeof SessionFindByIdResponseSchema
>;
export type SessionUpdateResponseDto = z.infer<
  typeof SessionUpdateResponseSchema
>;
export type SessionActivateResponseDto = z.infer<
  typeof SessionActivateResponseSchema
>;
export type SessionDeactivateResponseDto = z.infer<
  typeof SessionDeactivateResponseSchema
>;
export type SessionPageResponseDto = z.infer<typeof SessionPageResponseSchema>;
