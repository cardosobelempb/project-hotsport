// ============================================================
// UserProfile.schema.ts
// Schemas exclusivos da entidade UserProfile.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";

import { DocumentType } from "@/common/shared/enums/document-type.enum";
import { IsoDateTimeInput, UUIDString } from "@/common/shared/schemas/helpers";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const UserProfileParamsSchema = z.object({
  UserProfileId: UUIDString,
});

export type UserProfileParams = z.infer<typeof UserProfileParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const UserProfileSchema = z
  .object({
    id: UUIDString,
    userId: UUIDString,
    firstName: z.string(ValidatorMessage.REQUIRED_FIELD).optional(),
    lastName: z.string(ValidatorMessage.REQUIRED_FIELD).optional(),
    displayName: z.string(ValidatorMessage.REQUIRED_FIELD).optional(),
    birthDate: IsoDateTimeInput.optional().nullable(),
    phone: z.string(ValidatorMessage.REQUIRED_PHONE).optional(),
    avatarUrl: z.string(ValidatorMessage.REQUIRED_FIELD).optional(),
    documentType: z.enum(DocumentType).optional(),
    documentNumber: z.string(ValidatorMessage.REQUIRED_FIELD).optional(),
    email: z.string(ValidatorMessage.REQUIRED_FIELD).optional(),
    createdAt: IsoDateTimeInput.optional().nullable(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateUserProfileSchema = UserProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do UserProfileSchema base
export const UpdateUserProfileSchema = UserProfileSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const UserProfileResponseSchema = UserProfileSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const UserProfileSummarySchema = UserProfileSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  displayName: true,
  email: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa UserProfileResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const UserProfileCreateResponseSchema = createResponseSchema(
  UserProfileResponseSchema,
);
export const UserProfileFindByIdResponseSchema = findResponseSchema(
  UserProfileResponseSchema,
);
export const UserProfileUpdateResponseSchema = updateResponseSchema(
  UserProfileResponseSchema,
);
export const UserProfileActivateResponseSchema = actionResponseSchema();
export const UserProfileDeactivateResponseSchema = actionResponseSchema();
export const UserProfilePageResponseSchema = pageResponseSchema(
  UserProfileSummarySchema,
);
