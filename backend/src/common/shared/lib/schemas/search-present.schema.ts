import z from "zod";
import { PageableSchema } from "./pageable.schema";
import { SortSchema } from "./sort.schema.schema";

/**
 * Factory de schema paginado — recebe o schema do conteúdo e retorna
 * o schema completo no contrato Spring Data Page<T>.
 *
 * @param contentSchema - Schema Zod do item individual do content
 *
 * @example
 * const OrganizationPageSchema = PageResponseSchema(OrganizationSchema);
 * type OrganizationPage = z.infer<typeof OrganizationPageSchema>;
 */
export const PageResponseSchema = <T extends z.ZodTypeAny>(contentSchema: T) =>
  z.object({
    content: z.array(contentSchema),
    pageable: PageableSchema,
    totalPages: z.number().int().nonnegative(),
    totalElements: z.number().int().nonnegative(),
    last: z.boolean(),
    size: z.number().int().positive(),
    number: z.number().int().nonnegative(),
    sort: SortSchema,
    numberOfElements: z.number().int().nonnegative(),
    first: z.boolean(),
    empty: z.boolean(),
  });

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
export type SortSchema = z.infer<typeof SortSchema>;
export type PageableSchema = z.infer<typeof PageableSchema>;
export type PageResponse<T> = ReturnType<
  typeof PageResponseSchema<z.ZodType<T>>
>["type"];
