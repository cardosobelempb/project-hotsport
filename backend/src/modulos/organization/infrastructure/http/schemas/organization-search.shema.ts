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
