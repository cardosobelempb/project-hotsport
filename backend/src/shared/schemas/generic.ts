import { z } from "zod";

export const MessageSchema = z.object({
  message: z.string(),
});

export const ParamsIdNumberSchema = z.object({
  id: z.coerce.number().int(),
});

export const ParamsIdStringSchema = z.object({
  id: z.string().min(1),
});

// Compat (se ainda existir uso antigo)
export const ParamsIdSchema = ParamsIdStringSchema;

export const CleanupResponseSchema = z.object({
  message: z.string(),
  affected: z.number().int(),
});

export const StatusSchema = z.object({
  ok: z.boolean(),
});
