import z from "zod";
import { HttpErrorSchema } from "./error";
import { PageableSchema } from "./pageable.schema";
import { SortSchema } from "./sort.schema";

/**
 * Generic paginated response schema
 * Use .extend() or replace `z.any()` for strong typing of content
 */
export const PaginatedPresent = z.object({
  content: z.array(z.any()),

  pageable: PageableSchema,

  last: z.boolean(),
  totalPages: z.number().int().min(0),
  totalElements: z.number().int().min(0),

  size: z.number().int().min(1),
  number: z.number().int().min(0),

  sort: SortSchema,

  first: z.boolean(),
  numberOfElements: z.number().int().min(0),
  empty: z.boolean(),
});

export const PaginatedPresentSchema = {
  200: PaginatedPresent,
  404: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
  default: HttpErrorSchema,
} as const;

export type SortDto = z.infer<typeof SortSchema>;
export type PageableDto = z.infer<typeof PageableSchema>;
export type PaginatedResponseDto = z.infer<typeof PaginatedPresentSchema>;
