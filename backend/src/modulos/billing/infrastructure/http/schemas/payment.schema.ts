import { z } from "zod";

import { EmailString, IsoDateTimeString } from "@/schemas/helpers";

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  email: EmailString.nullable(),
  planName: z.string().nullable(),
  amountCents: z.number().int(),
  status: z.string().nullable(),

  // Melhor: padronizar como string no response (BigInt -> string)
  mercadoPagoId: z.string().uuid().nullable(),

  macAddress: z.string().nullable(),
  cpf: z.string().nullable(),
  ipAddress: z.string().nullable(),

  createdAt: IsoDateTimeString,
  expiresAt: IsoDateTimeString.nullable(),
  updatedAt: IsoDateTimeString,
});

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const PaymentListSchema = z.array(PaymentSchema);
