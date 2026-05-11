// ============================================================
// user.schema.ts
// Schemas exclusivos da entidade User.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";
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

export const UserParamsSchema = z.object({
  userId: UUIDString,
});

export type UserParams = z.infer<typeof UserParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const UserSchema = z
  .object({
    id: UUIDString,
    email: z.string(ValidatorMessage.REQUIRED_FIELD),
    passwordHash: z.string(ValidatorMessage.REQUIRED_FIELD),
    emailVerified: IsoDateTimeInput.optional().nullable(),
    createdAt: IsoDateTimeInput.optional(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateUserSchema = UserSchema.omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do UserSchema base
export const UpdateUserSchema = UserSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const UserResponseSchema = UserSchema.omit({
  passwordHash: true, // Nunca exponha hashes de senha em respostas HTTP!
  emailVerified: true, // Decida se quer expor ou não — aqui optamos por ocultar
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const UserSummarySchema = UserSchema.pick({
  id: true,
  email: true,
});

export const UserAuthSchema = UserSchema.pick({
  id: true,
  email: true,
  emailVerified: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa UserResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const UserCreateResponseSchema =
  createResponseSchema(UserResponseSchema);
export const UserFindByIdResponseSchema =
  findResponseSchema(UserResponseSchema);
export const UserUpdateResponseSchema =
  updateResponseSchema(UserResponseSchema);
export const UserActivateResponseSchema = actionResponseSchema();
export const UserDeactivateResponseSchema = actionResponseSchema();
export const UserPageResponseSchema = pageResponseSchema(UserSummarySchema);
