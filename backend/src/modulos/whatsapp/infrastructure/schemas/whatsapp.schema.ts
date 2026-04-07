import { z } from "zod";

export const WhatsappStatusSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
});
