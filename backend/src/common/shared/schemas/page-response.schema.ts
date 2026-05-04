// ============================================================
// page-response.schema.ts
// Schema Zod genérico para validação/parsing de respostas paginadas
// ============================================================

import { z } from "zod";

/**
 * Schema de metadados de ordenação
 */
export const SortSchema = z.object({
  sorted: z.boolean(),
  unsorted: z.boolean(),
  empty: z.boolean(),
});

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
