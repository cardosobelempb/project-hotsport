import { z } from "zod";

import { IsoDateTimeString, UUIDString } from "@/shared/schemas";

export const LgpdLoginSchema = z.object({
  id: UUIDString,
  cpf: z.string(),
  accepted: z.boolean(),
  mac: z.string().nullable(),
  ip: z.string().nullable(),
  createdAt: IsoDateTimeString,
  name: z.string().nullable(),
  phone: z.string().nullable(),
});

export const RegisterLgpdSchema = z.object({
  cpf: z.string().min(11).max(14),
  accepted: z.boolean(),
  mac: z.string().optional(),
  ip: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});
