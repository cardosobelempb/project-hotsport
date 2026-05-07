import z from "zod";
import { SortSchema } from "./sort.schema.schema";

/**
 * Schema de metadados de paginação
 */
export const PageableSchema = z.object({
  sort: SortSchema,
  offset: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  pageNumber: z.number().int().nonnegative(),
  paged: z.boolean(),
  unpaged: z.boolean(),
});
