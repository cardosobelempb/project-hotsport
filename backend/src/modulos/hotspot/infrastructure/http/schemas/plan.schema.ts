import { IsoDateTimeInput, UUIDString } from "@/shared/schemas/helpers";
import { z } from "zod";

export const PlanSchema = z.object({
  id: UUIDString,
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  durationMins: z.number().int(),
  downloadSpeed: z.string(),
  uploadSpeed: z.string(),
  mikrotikId: z.number().int(),
  isActive: z.boolean(),
  addressPool: z.string(),
  sharedUsers: z.number().int(),
  createdAt: IsoDateTimeInput,
  updatedAt: IsoDateTimeInput,
});

export const CreatePlanSchema = PlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePlanSchema = CreatePlanSchema.partial();

export const PlanListSchema = z.array(PlanSchema);
export const PlanCreateSchema = CreatePlanSchema;
