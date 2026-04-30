import { z } from "zod";
import { OrganizationBaseSchema } from "./organization-present.shema";

export const OrganizationSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(15),
  filter: z.string().trim().default(""),
  sortBy: z
    .enum(["name", "slug", "status", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const OrganizationSearchResponseSchema = z.object({
  items: z.array(OrganizationBaseSchema),
  meta: z.object({
    currentPage: z.number().int().min(1),
    perPage: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    sortBy: z.string().nullable(),
    sortDirection: z.enum(["asc", "desc"]),
    filter: z.string(),
  }),
});

export const OrganizationSearchPresentSchema = {
  200: OrganizationSearchResponseSchema,
} as const;

// export type OrganizationSearchDto = z.infer<typeof OrganizationSearchSchema>;
// export type OrganizationsPresentDto = z.infer<
//   typeof OrganizationSearchPresentSchema
// >;

/**
 * Sort metadata
 */
export const SortSchema = z.object({
  sorted: z.boolean(),
  unsorted: z.boolean(),
  empty: z.boolean(),
});

export interface SortDto {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

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

export interface PageableDto {
  pageNumber: number;
  pageSize: number;
  sort: SortDto;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * Generic paginated response DTO
 */
export interface PaginatedResponseDto<T> {
  content: T[];

  pageable: PageableDto;

  last: boolean;
  totalPages: number;
  totalElements: number;

  size: number;
  number: number;

  sort: SortDto;

  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

/**
 * Generic paginated response schema
 * Replace z.any() with specific schema if needed
 */
export const PaginatedResponseSchema = z.object({
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
