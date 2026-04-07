import { z } from "zod";

import { IsoDateTimeString, UUIDString } from "@/shared/schemas";

export const RadiusUserSchema = z.object({
  id: UUIDString,
  username: z.string(),
  planId: z.number().int().nullable(),
  nasId: z.number().int().nullable(),
  createdAt: IsoDateTimeString,
});

export const CreateRadiusUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  planId: z.number().int().optional(),
  nasId: z.number().int().optional(),
});
