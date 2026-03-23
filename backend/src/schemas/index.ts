import { z } from 'zod';

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export type ErrorDto = z.infer<typeof ErrorSchema>;
