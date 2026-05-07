import z from "zod";

/*/* Schema de entrada para buscas paginadas */
export const PageQuerySchema = z
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
