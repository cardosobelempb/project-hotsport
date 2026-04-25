import z from "zod";
import { SortSchema } from "./sort.schema";

/**
 * Pageable metadata
 */
export const PageableSchema = z.object({
  pageNumber: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  sort: SortSchema,
  offset: z.number().int().min(0),
  paged: z.boolean(),
  unpaged: z.boolean(),
});
