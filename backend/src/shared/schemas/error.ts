import { z } from "zod";

export const ErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
  path: z.string().optional(),
  fieldName: z.string().optional(),
  timestamp: z.string(),
});

// Para erros com issues (Zod validation)
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
