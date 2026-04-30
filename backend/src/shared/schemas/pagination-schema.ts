// ============================================================
// pagination.schema.ts
// Schemas genéricos de paginação — padrão Spring Data Page<T>
// ============================================================

import { z } from "zod";

/**
 * Metadados de ordenação
 */
export const SortMetaSchema = z.object({
  sorted: z.boolean(),
  unsorted: z.boolean(),
  empty: z.boolean(),
});

/**
 * Metadados de paginação
 */
export const PageableMetaSchema = z.object({
  sort: SortMetaSchema,
  offset: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  pageNumber: z.number().int().nonnegative(),
  paged: z.boolean(),
  unpaged: z.boolean(),
});

/**
 * Factory de Page<T> — recebe o schema do item e retorna
 * o schema completo no contrato Spring Data Page.
 *
 * @param contentSchema - Schema Zod do item individual
 *
 * @example
 * // Gera Page<Organization>
 * const OrgPageSchema = PageSchema(OrganizationSchema);
 * type OrgPage = z.infer<typeof OrgPageSchema>;
 *
 * // Gera Page<User>
 * const UserPageSchema = PageSchema(UserSchema);
 */
export const PageSchema = <T extends z.ZodTypeAny>(contentSchema: T) =>
  z.object({
    content: z.array(contentSchema),
    pageable: PageableMetaSchema,
    sort: SortMetaSchema,
    totalPages: z.number().int().nonnegative(),
    totalElements: z.number().int().nonnegative(),
    numberOfElements: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    number: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
  });

/*/* Schema de entrada para buscas paginadas */
export const PageInputSchema = z
  .object({
    page: z.coerce.number().int().min(0).default(0),

    size: z.coerce.number().int().min(1).max(100).default(20),

    sort: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z][a-zA-Z0-9_.]*,(asc|desc)$/i,
        "sort deve seguir o formato: campo,asc ou campo,desc",
      )
      .optional(),

    filter: z.string().trim().default(""),
  })
  .strict();

export type PageInputDto = z.infer<typeof PageInputSchema>;

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
export type SortMeta = z.infer<typeof SortMetaSchema>;
export type PageableMeta = z.infer<typeof PageableMetaSchema>;

// ✅ Corrigido: "_type" em vez de "type"
export type PageResponse<T> = z.infer<
  ReturnType<typeof PageSchema<z.ZodType<T>>>
>;
