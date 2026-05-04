import { z } from "zod";
import { Environment } from "../../generated/prisma";
import { UUIDString } from "./helpers";

export const EfiConfigSchema = z.object({
  id: UUIDString,
  clientId: z.string(),
  clientSecret: z.string(),
  pixKey: z.string(),
  environment: z.enum(Environment),
  certificateName: z.string().nullable(),
});

export const SaveEfiConfigSchema = EfiConfigSchema.omit({ id: true }).extend({
  certificateName: z.string().optional(),
});
