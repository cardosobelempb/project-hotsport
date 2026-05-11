// ============================================================
// lgpdconsents.schema.ts
// Schemas exclusivos da entidade LgpdConsents.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { LgpdConsentStatus } from "@/common/shared/enums/lgpd-consents-status.enum";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const LgpdConsentsParamsSchema = z.object({
  lgpdconsentsId: UUIDString,
});

export type LgpdConsentsParams = z.infer<typeof LgpdConsentsParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const LgpdConsentsSchema = z
  .object({
    id: UuidSchema,
    userId: UuidSchema,
    consentTerms: s.isVerified,
    consentMarketing: s.isVerified,
    consentDataSharing: s.isVerified,
    consentAnalytics: s.isVerified,
    ipAddress: s.ipv4,
    macAddress: s.mac,
    userAgent: s.string,
    status: z.enum(LgpdConsentStatus),
    consentVersion: s.string,
    withdrawnAt: s.nullableDate,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateLgpdConsentsSchema = LgpdConsentsSchema.omit({
  id: true,
  status: true,
  withdrawnAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do LgpdConsentsSchema base
export const UpdateLgpdConsentsSchema = LgpdConsentsSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const LgpdConsentsResponseSchema = LgpdConsentsSchema.omit({
  updatedAt: true,
  deletedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const LgpdConsentsSummarySchema = LgpdConsentsSchema.pick({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
});

export const LgpdConsentsAuthSchema = LgpdConsentsSchema.pick({
  id: true,
  userId: true,
  consentTerms: true,
  consentMarketing: true,
  consentDataSharing: true,
  consentAnalytics: true,
  ipAddress: true,
  macAddress: true,
  userAgent: true,
  status: true,
  consentVersion: true,
  withdrawnAt: true,
  createdAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa LgpdConsentsResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const LgpdConsentsCreateResponseSchema = createResponseSchema(
  LgpdConsentsResponseSchema,
);
export const LgpdConsentsFindByIdResponseSchema = findResponseSchema(
  LgpdConsentsResponseSchema,
);
export const LgpdConsentsUpdateResponseSchema = updateResponseSchema(
  LgpdConsentsResponseSchema,
);
export const LgpdConsentsActivateResponseSchema = actionResponseSchema();
export const LgpdConsentsDeactivateResponseSchema = actionResponseSchema();
export const LgpdConsentsPageResponseSchema = pageResponseSchema(
  LgpdConsentsSummarySchema,
);
