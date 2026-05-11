// ============================================================
// UserProfile.schema.ts
// Schemas exclusivos da entidade UserProfile.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { DocumentType } from "@/common/shared/enums/document-type.enum";
import { UserProfileStatus } from "@/common/shared/enums/user-profile-status.enum";
import { BirthDateSchema } from "@/common/shared/lib/schemas/dates.schema";
import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import {
  PhoneSchema,
  UuidSchema,
} from "@/common/shared/lib/schemas/string.schema";

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
    id: UuidSchema,
    userId: UuidSchema,
    firstName: s.name,
    lastName: s.name,
    displayName: s.name,
    fullName: s.name,
    birthDate: BirthDateSchema.nullable(),
    phone: PhoneSchema,
    avatarUrl: s.url,
    documentType: z.enum(DocumentType),
    status: z.enum(UserProfileStatus),
    documentNumber: s.string,
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateUserProfileSchema = UserProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}); // Reutiliza campos do payload de registro

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
  userId: true,
  displayName: true,
  fullName: true,
  avatarUrl: true,
  status: true,
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
