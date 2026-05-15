// ============================================================
// Voucher.schema.ts
// Schemas exclusivos da entidade Voucher.
// ============================================================

import { z } from "zod";

import { VoucherStatus } from "@/common/shared/enums/voucher-status.enum";
import { IpAddressSchema } from "@/common/shared/lib/schemas/ip-address.schema";
import { MacAddressSchema } from "@/common/shared/lib/schemas/mac-address.schema";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const VoucherParamsSchema = z.object({
  VoucherCode: s.string.max(50),
  OrganizationId: UuidSchema.optional(),
  HotspotPlanId: UuidSchema.optional(),
});

export type VoucherParams = z.infer<typeof VoucherParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const VoucherSchema = z
  .object({
    id: UuidSchema,
    organizationId: UuidSchema.nullable(),
    mikrotikId: UuidSchema.nullable(),
    hotspotPlanId: UuidSchema.nullable(),
    code: s.string.max(50),
    status: z.enum(VoucherStatus),
    usedAt: s.nullableDate,
    expiredAt: s.nullableDate,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const GenerateVoucherBulkSchema = z.object({
  organizationId: UuidSchema,
  hotspotPlanId: UuidSchema,
  quantity: z.number().min(1).max(1000),
  expireDays: z.number().optional(),
});

export const RedeemVoucherSchema = z.object({
  code: s.string.max(50),
  macAddress: MacAddressSchema.optional(),
  ipAddress: IpAddressSchema.optional(),
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const VoucherResponseSchema = VoucherSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const VoucherSummarySchema = VoucherResponseSchema.pick({
  id: true,
  code: true,
  status: true,
  hotspotPlanId: true,
  expiredAt: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const VoucherGenerateResponseSchema = createResponseSchema(
  z.array(VoucherResponseSchema),
);
export const VoucherRedeemResponseSchema = findResponseSchema(
  VoucherResponseSchema,
);
export const VoucherPageResponseSchema =
  pageResponseSchema(VoucherSummarySchema);
export const VoucherExpireResponseSchema = actionResponseSchema();
