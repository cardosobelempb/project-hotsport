// ============================================================
// Account.schema.ts
// Schemas exclusivos da entidade Account.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";
import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { IsoDateTimeInput, UUIDString } from "@/common/shared/schemas/helpers";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const AccountParamsSchema = z.object({
  AccountId: UUIDString,
});

export type AccountParams = z.infer<typeof AccountParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const AccountSchema = z
  .object({
    id: UUIDString,
    userId: UUIDString,
    providerType: z.enum(ProviderType),
    provider: z.string(ValidatorMessage.REQUIRED_FIELD),
    providerAccountId: UUIDString,
    refreshToken: z.string().optional().nullable(),
    accessToken: z.string().optional().nullable(),
    expiresAt: z.number().optional().nullable(),
    tokenType: z.string().optional().nullable(),
    scope: z.string().optional().nullable(),
    idToken: z.string().optional().nullable(),
    sessionState: z.string().optional().nullable(),
    createdAt: IsoDateTimeInput.optional(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do AccountSchema base
export const UpdateAccountSchema = AccountSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const AccountResponseSchema = AccountSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const AccountSummarySchema = AccountSchema.pick({
  id: true,
  userId: true,
  provider: true,
  providerAccountId: true,
  providerType: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa AccountResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const AccountCreateResponseSchema = createResponseSchema(
  AccountResponseSchema,
);
export const AccountFindByIdResponseSchema = findResponseSchema(
  AccountResponseSchema,
);
export const AccountUpdateResponseSchema = updateResponseSchema(
  AccountResponseSchema,
);
export const AccountActivateResponseSchema = actionResponseSchema();
export const AccountDeactivateResponseSchema = actionResponseSchema();
export const AccountPageResponseSchema =
  pageResponseSchema(AccountSummarySchema);
