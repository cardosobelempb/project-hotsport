import z from "zod";

// Limpeza
export const LimpezaResponseSchema = z.object({
  message: z.string(),
  affected: z.number().int(),
});
