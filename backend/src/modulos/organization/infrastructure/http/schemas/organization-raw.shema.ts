import { z } from "zod";

export const organizationRawSchema = z.object({
  id: z.string().min(1, "Id is required"),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().nullable(),
});

export type OrganizationRawDto = z.infer<typeof organizationRawSchema>;
