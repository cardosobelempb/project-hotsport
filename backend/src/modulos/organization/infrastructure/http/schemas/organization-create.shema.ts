import { z } from "zod";

export const organizationCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9-]+$/),

  logoUrl: z
    .string()
    .url("Logo URL must be a valid URL")
    .optional()
    .nullable()
    .transform((val) => val ?? null),
});

export type OrganizationCreateDto = z.infer<typeof organizationCreateSchema>;
