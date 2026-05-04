// ============================================================
// pagination.schema.ts
// Schemas genéricos de paginação — padrão Spring Data Page<T>
// ============================================================

import { z } from "zod";
import { PagePageableSchema } from "./page-pageable.schema";
import { PageSortSchema } from "./page-sort.schema";

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
    pageable: PagePageableSchema,
    sort: PageSortSchema,
    totalPages: z.number().int().nonnegative(),
    totalElements: z.number().int().nonnegative(),
    numberOfElements: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    number: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
  });

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
export type SortMeta = z.infer<typeof PagePageableSchema>;
export type PageableMeta = z.infer<typeof PagePageableSchema>;

// ✅ Corrigido: "_type" em vez de "type"
export type PageResponse<T> = z.infer<
  ReturnType<typeof PageSchema<z.ZodType<T>>>
>;
