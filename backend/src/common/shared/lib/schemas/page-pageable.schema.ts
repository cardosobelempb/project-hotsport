import z from "zod";
import { PageSortSchema } from "./page-sort.schema";

/**
 * Pageable metadata
 */
export const PagePageableSchema = z.object({
  pageNumber: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  sort: PageSortSchema,
  offset: z.number().int().min(0),
  paged: z.boolean(),
  unpaged: z.boolean(),
});
