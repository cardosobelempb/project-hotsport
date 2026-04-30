// ============================================================
// error.schema.ts
// Schemas de erro reutilizáveis em toda a aplicação
// ============================================================

import { z } from "zod";

/**
 * Erro padrão da aplicação (400, 404, 409, 500...)
 */
export const ErrorSchema = z.object({
  statusCode: z.number(),
  code: z.string().optional(),
  error: z.string().optional(),
  message: z.string(),
  path: z.string().optional(),
  fieldName: z.string().optional(),
  timestamp: z.string().optional(),
});

/**
 * Erro de validação (422) com lista de campos inválidos
 */
export const ValidationErrorSchema = ErrorSchema.extend({
  issues: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
export type ErrorResponse = z.infer<typeof ErrorSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
