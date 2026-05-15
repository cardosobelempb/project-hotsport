// ============================================================
// Campaign.schema.ts
// Schemas exclusivos da entidade Campaign.
// ============================================================

import { z } from "zod";

import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const CampaignParamsSchema = z.object({
  CampaignId: UUIDString,
  OrganizationId: UuidSchema,
});

export type CampaignParams = z.infer<typeof CampaignParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const CampaignSchema = z
  .object({
    id: UuidSchema,
    organizationId: UuidSchema,
    name: s.string.max(150),
    description: s.string.nullable(),
    isActive: s.isActive.default(true),
    views: s.number.default(0),
    createdAt: s.date,
    updatedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateCampaignSchema = CampaignSchema.omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCampaignSchema = CampaignSchema.partial().omit({
  id: true,
  organizationId: true,
  views: true, // Auto-increment
  createdAt: true,
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const CampaignResponseSchema = CampaignSchema.omit({
  updatedAt: true,
});

export const CampaignSummarySchema = CampaignResponseSchema.pick({
  id: true,
  name: true,
  isActive: true,
  views: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const CampaignCreateResponseSchema = createResponseSchema(
  CampaignResponseSchema,
);
export const CampaignPageResponseSchema = pageResponseSchema(
  CampaignSummarySchema,
);
export const CampaignActivateResponseSchema = actionResponseSchema();
