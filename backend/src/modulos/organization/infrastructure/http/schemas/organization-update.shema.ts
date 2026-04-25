import { z } from "zod";

export const OrganizationUpdateSchema = z.object({
  // organizationId: z.string().uuid(),

  name: z.string().trim().min(2).max(120).optional(),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/)
    .nullable()
    .optional(),

  logoUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (!val || val === "") return null;
      return val;
    }),
});

export type OrganizationUpdateDto = z.infer<typeof OrganizationUpdateSchema>;
