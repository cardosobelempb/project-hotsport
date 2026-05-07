import { z } from "zod";

/**
 * Sort metadata
 */
export const PageSortSchema = z.object({
  sorted: z.boolean(),
  unsorted: z.boolean(),
  empty: z.boolean(),
});

export type SortSchemaDto = z.infer<typeof PageSortSchema>;
