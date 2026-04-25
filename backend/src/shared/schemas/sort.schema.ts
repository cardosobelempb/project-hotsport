import { z } from "zod";

/**
 * Sort metadata
 */
export const SortSchema = z.object({
  sorted: z.boolean(),
  unsorted: z.boolean(),
  empty: z.boolean(),
});

export type SortSchemaDto = z.infer<typeof SortSchema>;
