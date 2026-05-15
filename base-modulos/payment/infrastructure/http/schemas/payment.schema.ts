// ============================================================
// Payment.schema.ts
// Schemas exclusivos da entidade Payment.
// ============================================================

import { z } from "zod";

import { PaymentStatus } from "@/common/shared/enums/payment-status.enum";
import { DecimalSchema } from "@/common/shared/lib/schemas/decimal.schema";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const PaymentParamsSchema = z.object({
  PaymentId: UuidSchema,
  OrganizationId: UuidSchema,
  SubscriptionId: UuidSchema.optional(),
});

export type PaymentParams = z.infer<typeof PaymentParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const PaymentSchema = z
  .object({
    id: UuidSchema,
    organizationId: UuidSchema,
    subscriptionId: UuidSchema.nullable(),
    amount: DecimalSchema,
    currency: s.string.default("BRL"),
    status: z.enum(PaymentStatus),
    provider: s.string.max(50).nullable(),
    providerTransactionId: s.string.max(255).nullable(),
    description: s.string.max(255).nullable(),
    dueAt: s.nullableDate,
    paidAt: s.nullableDate,
    failedAt: s.nullableDate,
    refundedAt: s.nullableDate,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────
// Webhook payloads usam schemas específicos do provider

export const ProcessPaymentSchema = PaymentSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const PaymentResponseSchema = PaymentSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const PaymentSummarySchema = PaymentResponseSchema.pick({
  id: true,
  subscriptionId: true,
  amount: true,
  status: true,
  providerTransactionId: true,
  paidAt: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const PaymentCreateResponseSchema = createResponseSchema(
  PaymentResponseSchema,
);
export const PaymentPageResponseSchema =
  pageResponseSchema(PaymentSummarySchema);
export const PaymentRefundResponseSchema = actionResponseSchema();
