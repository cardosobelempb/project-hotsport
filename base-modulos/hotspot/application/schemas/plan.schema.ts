// ============================================================
// HotspotPlan.schema.ts
// Schemas exclusivos da entidade HotspotPlan.
// ============================================================

import { z } from "zod";

import { HotspotPlanType } from "@/common/shared/enums/hotspot-plan-type.enum";

import { DecimalSchema } from "@/common/shared/lib/schemas/decimal.schema";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const HotspotPlanParamsSchema = z.object({
  HotspotPlanId: UuidSchema,
  OrganizationId: UuidSchema,
});

export type HotspotPlanParams = z.infer<typeof HotspotPlanParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const HotspotPlanSchema = z
  .object({
    id: UuidSchema,
    organizationId: UuidSchema,
    name: s.string.max(150),
    type: z.enum(HotspotPlanType),
    durationSecs: s.number.optional(), // null para unlimited
    dataLimitMb: s.number.optional(),
    price: DecimalSchema,
    isActive: s.isVerified.default(true),
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateHotspotPlanSchema = HotspotPlanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const UpdateHotspotPlanSchema = HotspotPlanSchema.partial().omit({
  id: true,
  organizationId: true,
  createdAt: true,
  deletedAt: true,
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const HotspotPlanResponseSchema = HotspotPlanSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const HotspotPlanSummarySchema = HotspotPlanResponseSchema.pick({
  id: true,
  name: true,
  type: true,
  price: true,
  isActive: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const HotspotPlanCreateResponseSchema = createResponseSchema(
  HotspotPlanResponseSchema,
);
export const HotspotPlanPageResponseSchema = pageResponseSchema(
  HotspotPlanSummarySchema,
);
export const HotspotPlanActivateResponseSchema = actionResponseSchema();
