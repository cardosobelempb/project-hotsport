// ============================================================
// LgpdConsents.schema.ts
// Schemas exclusivos da entidade LgpdConsents.
// ============================================================

import { z } from "zod";

import { LgpdConsentsStatus } from "@/common/shared/enums/lgpd-consents-status.enum";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { IpAddressSchema } from "@/common/shared/lib/schemas/ip-address.schema";
import { MacAddressSchema } from "@/common/shared/lib/schemas/mac-address.schema";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const LgpdConsentsParamsSchema = z.object({
  LgpdConsentsId: UUIDString,
  UserId: UUIDString,
});

export type LgpdConsentsParams = z.infer<typeof LgpdConsentsParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const LgpdConsentsSchema = z
  .object({
    id: UuidSchema,
    userId: UuidSchema,
    consentTerms: s.isVerified,
    consentMarketing: s.isVerified,
    consentDataSharing: s.isVerified,
    consentAnalytics: s.isVerified,
    ipAddress: IpAddressSchema,
    macAddress: MacAddressSchema,
    userAgent: s.string.max(500),
    consentVersion: s.string.max(10),
    status: z.enum(LgpdConsentsStatus),
    withdrawnAt: s.nullableDate,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateLgpdConsentsSchema = LgpdConsentsSchema.omit({
  id: true,
  status: true,
  withdrawnAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const UpdateLgpdConsentsSchema = LgpdConsentsSchema.partial().omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const LgpdConsentsResponseSchema = LgpdConsentsSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const LgpdConsentsSummarySchema = LgpdConsentsResponseSchema.pick({
  id: true,
  userId: true,
  consentVersion: true,
  consentTerms: true,
  consentMarketing: true,
  status: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const LgpdConsentsCreateResponseSchema = createResponseSchema(
  LgpdConsentsResponseSchema,
);
export const LgpdConsentsRevokeResponseSchema = actionResponseSchema();
