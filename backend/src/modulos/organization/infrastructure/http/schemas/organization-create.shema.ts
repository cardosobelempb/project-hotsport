import { z } from "zod";

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),

  slug: z
    .string("Slug must be a string")
    .min(1, "Slug é obrigatório")
    .regex(
      /^[a-z0-9-]+$/,
      "O slug deve conter apenas letras minúsculas, números e hífen",
    ),

  logoUrl: z
    .string()
    .url("Logo URL must be a valid URL")
    .optional()
    .nullable()
    .transform((val) => val ?? null),
});

export type OrganizationCreateDto = z.infer<typeof OrganizationCreateSchema>;
