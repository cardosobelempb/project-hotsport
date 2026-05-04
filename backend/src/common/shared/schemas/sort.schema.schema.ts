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
