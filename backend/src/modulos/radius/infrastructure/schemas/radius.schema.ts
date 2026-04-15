import { IsoDateTimeInput, UUIDString } from "@/shared/schemas/helpers";
import { z } from "zod";

export const RadiusUserSchema = z.object({
  id: UUIDString,
  username: z.string(),
  planId: z.number().int().nullable(),
  nasId: z.number().int().nullable(),
  createdAt: IsoDateTimeInput,
});

export const CreateRadiusUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  planId: z.number().int().optional(),
  nasId: z.number().int().optional(),
});
