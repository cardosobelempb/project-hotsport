// ============================================================
// Lead.schema.ts
// Schemas exclusivos da entidade Lead.
// ============================================================

import { z } from "zod";

import { LeadStatus } from "@/common/shared/enums/lead-status.enum";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { IpAddressSchema } from "@/common/shared/lib/schemas/ip-address.schema";
import { MacAddressSchema } from "@/common/shared/lib/schemas/mac-address.schema";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  pageResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import {
  CpfSchema,
  EmailSchema,
  PhoneSchema,
  UuidSchema,
} from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const LeadParamsSchema = z.object({
  LeadId: UUIDString,
  OrganizationId: UuidSchema.optional(),
});

export type LeadParams = z.infer<typeof LeadParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const LeadSchema = z
  .object({
    id: UuidSchema,
    userId: UuidSchema.nullable(),
    organizationId: UuidSchema.nullable(),
    tenantId: UuidSchema.nullable(),
    name: s.string.max(255).nullable(),
    email: EmailSchema.nullable(),
    phone: PhoneSchema.nullable(),
    cpf: CpfSchema.nullable(),
    mac: MacAddressSchema.nullable(),
    ip: IpAddressSchema.nullable(),
    status: z.enum(LeadStatus),
    source: s.string.default("portal").nullable(),
    observations: s.string.nullable(),
    lgpdAccepted: s.isVerified.default(false),
    lgpdAcceptedAt: s.nullableDate,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  lgpdAcceptedAt: true, // Auto-set
}).extend({
  lgpdAccepted: z.literal(true), // Obrigatório na criação
});

export const UpdateLeadSchema = LeadSchema.partial().omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const LeadResponseSchema = LeadSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

export const LeadSummarySchema = LeadResponseSchema.pick({
  id: true,
  name: true,
  phone: true,
  email: true,
  status: true,
  source: true,
  createdAt: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const LeadCreateResponseSchema =
  createResponseSchema(LeadResponseSchema);
export const LeadPageResponseSchema = pageResponseSchema(LeadSummarySchema);
export const LeadConvertResponseSchema = actionResponseSchema();
export const LeadExportResponseSchema = z.object({
  leads: z.array(LeadSummarySchema),
  total: s.number,
});
