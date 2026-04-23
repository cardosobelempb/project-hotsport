import { z } from "zod";

export const OrganizationUpdateSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character"),
  slug: z.string().min(1, "Slug must be at least 1 character").nullable(),
  logoUrl: z.string().url("Logo URL must be a valid URL").nullable(),
});

export type OrganizationUpdateDto = z.infer<typeof OrganizationUpdateSchema>;
