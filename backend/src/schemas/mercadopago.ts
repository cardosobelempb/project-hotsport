import { z } from "zod";

import { IsoDateTimeString, UUIDString } from "./helpers.js";

export const MercadoPagoConfigSchema = z.object({
  id: UUIDString,
  publicKey: z.string().nullable(),
  accessToken: z.string().nullable(),
  clientId: z.string().nullable(),
  clientSecret: z.string().nullable(),
  webhookSecret: z.string().nullable(),
  updatedAt: IsoDateTimeString.optional(), // se sua API não devolver, deixa optional
});

export const SaveMercadoPagoConfigSchema = MercadoPagoConfigSchema.omit({
  id: true,
}).partial();
