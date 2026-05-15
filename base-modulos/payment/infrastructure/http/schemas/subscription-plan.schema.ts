// ============================================================
// SubscriptionPlan.schema.ts
// Schemas exclusivos da entidade SubscriptionPlan.
// ============================================================

import { z } from "zod";

import { DecimalSchema } from "@/common/shared/lib/schemas/decimal.schema";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";
import { BillingCycleDto } from "@/modulos/payment/application/dto/billing-cycle.dto";
import { SubscriptionPlanStatus } from "@/modulos/payment/application/schemas/subscription-plan-status.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const SubscriptionPlanParamsSchema = z.object({
  SubscriptionPlanId: UUIDString,
  OrganizationId: UuidSchema.optional(),
});

export type SubscriptionPlanParams = z.infer<
  typeof SubscriptionPlanParamsSchema
>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const SubscriptionPlanSchema = z
  .object({
    id: UuidSchema,
    organizationId: UuidSchema.nullable(),
    code: s.string.max(50),
    name: s.string.max(120),
    description: s.string.max(500).nullable(),
    status: z.enum(SubscriptionPlanStatus),
    billingCycle: z.enum(BillingCycleDto),
    amount: DecimalSchema,
    currency: s.string.default("BRL"),
    trialDays: s.number.optional(),
    sortOrder: s.number.default(0),
    isPublic: s.isActive.default(true),
    isDefault: s.isVerified.default(false),
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateSubscriptionPlanSchema = SubscriptionPlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const UpdateSubscriptionPlanSchema =
  SubscriptionPlanSchema.partial().omit({
    id: true,
    organizationId: true,
    createdAt: true,
    deletedAt: true,
  });

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const SubscriptionPlanResponseSchema = SubscriptionPlanSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const SubscriptionPlanSummarySchema =
  SubscriptionPlanResponseSchema.pick({
    id: true,
    code: true,
    name: true,
    amount: true,
    currency: true,
    isPublic: true,
    status: true,
  });

// ─── Response wrappers ────────────────────────────────────────────────────────

export const SubscriptionPlanCreateResponseSchema = createResponseSchema(
  SubscriptionPlanResponseSchema,
);
export const SubscriptionPlanPageResponseSchema = pageResponseSchema(
  SubscriptionPlanSummarySchema,
);
export const SubscriptionPlanPublishResponseSchema = actionResponseSchema();
