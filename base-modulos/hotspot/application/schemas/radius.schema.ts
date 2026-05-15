import { s } from "@/common/shared/lib/schemas/primitives";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

import { z } from "zod";

export const RadiusUserSchema = z.object({
  id: UuidSchema,
  username: z.string(),
  planId: z.number().int().nullable(),
  nasId: z.number().int().nullable(),
  createdAt: s.date,
});

export const CreateRadiusUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  planId: z.number().int().optional(),
  nasId: z.number().int().optional(),
});
