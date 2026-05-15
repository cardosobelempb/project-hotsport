// ============================================================
// Portal.schema.ts
// Schemas exclusivos da entidade Portal.
// ============================================================

import { z } from "zod";

import { ColorHexSchema } from "@/common/shared/lib/schemas/color-hex.schema";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import {
  SlugSchema,
  UrlSchema,
  UuidSchema,
} from "@/common/shared/lib/schemas/string.schema";

export const PortalParamsSchema = z.object({
  PortalId: UUIDString,
  OrganizationId: UuidSchema,
  PortalSlug: SlugSchema,
});

export type PortalParams = z.infer<typeof PortalParamsSchema>;

export const PortalSchema = z
  .object({
    id: UuidSchema,
    organizationId: UuidSchema,
    name: s.string.max(100),
    slug: SlugSchema,
    type: s.string.default("basico"),
    redirectUrl: UrlSchema.nullable(),
    htmlContent: s.string.nullable(),
    description: s.string.nullable(),
    isActive: s.isActive.default(true),
    customCss: s.string.nullable(),
    logoUrl: UrlSchema.nullable(),
    primaryColor: ColorHexSchema.default({
      type: "color-hex",
      value: "#0f111a",
    }),
    backgroundColor: ColorHexSchema.default({
      type: "color-hex",
      value: "#ffffff",
    }),
    showPlans: s.isVerified.default(false),
    showLgpd: s.isActive.default(true),
    whatsappEnabled: s.isVerified.default(false),
    createdAt: s.date,
    updatedAt: s.nullableDate,
  })
  .strict();

export const CreatePortalSchema = PortalSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePortalSchema = PortalSchema.partial().omit({
  id: true,
  organizationId: true,
  createdAt: true,
});

export const PortalResponseSchema = PortalSchema.omit({
  updatedAt: true,
});

export const PortalPublicSchema = PortalResponseSchema.pick({
  slug: true,
  htmlContent: true,
  customCss: true,
  primaryColor: true,
  showPlans: true,
  showLgpd: true,
});

export const PortalCreateResponseSchema =
  createResponseSchema(PortalResponseSchema);
export const PortalPageResponseSchema = pageResponseSchema(PortalPublicSchema);
