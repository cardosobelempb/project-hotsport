// ============================================================
// lead.schema.ts
// Schemas exclusivos da entidade Lead.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";
import { LeadStatus } from "@/common/shared/enums/lead-status.enum";
import {
  IsoDateTimeInput,
  UUIDString,
} from "@/common/shared/lib/schemas/helpers";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const LeadParamsSchema = z.object({
  leadId: UUIDString,
});

export type LeadParams = z.infer<typeof LeadParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const LeadSchema = z
  .object({
    id: UUIDString,
    userId: UUIDString.nullable(),
    tenantId: UUIDString.nullable(),
    organizationId: UUIDString.nullable(),
    name: z.string(ValidatorMessage.REQUIRED_FIELD),
    email: z.string(ValidatorMessage.REQUIRED_FIELD),
    phone: z.string().nullable(),
    cpf: z.string().nullable(),
    mac: z.string().nullable(),
    ip: z.string().nullable(),
    status: z.enum(LeadStatus).default(LeadStatus.NEW),
    source: z.string().nullable().default("portal"),
    observations: z.string().nullable(),
    lgpdAccepted: z.boolean().default(false),
    lgpdAcceptedAt: IsoDateTimeInput.optional().nullable(),
    createdAt: IsoDateTimeInput.optional(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  userId: true,
  tenantId: true,
  organizationId: true,
  lgpdAcceptedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do LeadSchema base
export const UpdateLeadSchema = LeadSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const LeadResponseSchema = LeadSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const LeadSummarySchema = LeadSchema.pick({
  id: true,
  name: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa LeadResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const LeadCreateResponseSchema =
  createResponseSchema(LeadResponseSchema);
export const LeadFindByIdResponseSchema =
  findResponseSchema(LeadResponseSchema);
export const LeadUpdateResponseSchema =
  updateResponseSchema(LeadResponseSchema);
export const LeadActivateResponseSchema = actionResponseSchema();
export const LeadDeactivateResponseSchema = actionResponseSchema();
export const LeadPageResponseSchema = pageResponseSchema(LeadSummarySchema);
