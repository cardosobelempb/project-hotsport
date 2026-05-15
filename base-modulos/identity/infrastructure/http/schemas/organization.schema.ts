// ============================================================
// Organization.schema.ts
// Schemas exclusivos da entidade Organization.
// ============================================================

import { z } from "zod";

import { OrganizationStatus } from "@/common/shared/enums/organization-status.enum";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import {
  SlugSchema,
  UrlSchema,
  UuidSchema,
} from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const OrganizationParamsSchema = z.object({
  OrganizationId: UUIDString,
  TenantId: UUIDString,
});

export type OrganizationParams = z.infer<typeof OrganizationParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const OrganizationSchema = z
  .object({
    id: UuidSchema,
    tenantId: UuidSchema,
    name: s.string.max(150),
    slug: SlugSchema,
    logoUrl: UrlSchema.nullable(),
    status: z.enum(OrganizationStatus),
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const UpdateOrganizationSchema = OrganizationSchema.partial().omit({
  id: true,
  tenantId: true,
  createdAt: true,
  deletedAt: true,
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const OrganizationResponseSchema = OrganizationSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const OrganizationSummarySchema = OrganizationResponseSchema.pick({
  id: true,
  tenantId: true,
  name: true,
  slug: true,
  status: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const OrganizationCreateResponseSchema = createResponseSchema(
  OrganizationResponseSchema,
);
export const OrganizationPageResponseSchema = pageResponseSchema(
  OrganizationSummarySchema,
);
export const OrganizationActivateResponseSchema = actionResponseSchema();
