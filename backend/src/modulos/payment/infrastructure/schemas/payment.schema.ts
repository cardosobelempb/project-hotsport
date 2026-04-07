import z from "zod";

import { EmailString, UUIDString } from "@/shared/schemas";

// Payment
export const PaymentSchema = z.object({
  id: UUIDString,
  planId: UUIDString,
  email: EmailString.nullable(),
  planName: z.string().nullable(),
  amount: z.number().int(),
  status: z.string().nullable(),
  mpPaymentId: UUIDString,
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  mac: z.string().nullable(),
  cpf: z.string().nullable(),
  ip: z.string().nullable(),
});

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
});
