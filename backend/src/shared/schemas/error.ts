import { z } from "zod";

export const ErrorSchema = z.object({
  statusCode: z.number(),
  code: z.string().optional(),
  error: z.string().optional(),
  message: z.string(),
  path: z.string().optional(),
  fieldName: z.string().optional(),
  timestamp: z.string().optional(),
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

export const HttpErrorSchema = z.object({
  statusCode: z.number(),
  code: z.string().optional(),
  error: z.string().optional(),
  message: z.string(),
  path: z.string().optional(),
  fieldName: z.string().optional(),
  timestamp: z.string().optional(),

  issues: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});
