// ============================================================
// signin.schema.ts
// Schemas exclusivos da entidade Signin.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { UUIDString } from "@/common/shared/lib/schemas/helpers";
import { s } from "@/common/shared/lib/schemas/primitives";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import { MembershipSummarySchema } from "@/modulos/identity/infrastructure/http/schemas/member-ship.schema";
import { UserSummarySchema } from "@/modulos/identity/infrastructure/http/schemas/user.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const SigninParamsSchema = z.object({
  signinId: UUIDString,
});

export type SigninParams = z.infer<typeof SigninParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

// Resumo para listagem: versão compacta — evita over-fetching
export const SigninBodySchema = z.object({
  email: UserSummarySchema.shape.email,
  passwordHash: s.password,
});

export const SigninSchema = z
  .object({
    user: UserSummarySchema,
    memberships: z.array(MembershipSummarySchema),
    accessToken: s.token,
    refreshToken: s.token,
    expiresIn: s.number,
  })
  .strict();

export const SigninSummarySchema = SigninSchema.pick({
  user: true,
  memberships: true,
  accessToken: true,
  refreshToken: true,
  expiresIn: true,
});

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateSigninSchema = SigninSchema.omit({
  memberships: true,
  accessToken: true,
  refreshToken: true,
  expiresIn: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do SigninSchema base
export const UpdateSigninSchema = SigninSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const SigninResponseSchema = SigninSchema.omit({
  user: true,
  memberships: true,
  accessToken: true,
  refreshToken: true,
  expiresIn: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa SigninResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const SigninCreateResponseSchema =
  createResponseSchema(SigninResponseSchema);
export const SigninFindByIdResponseSchema =
  findResponseSchema(SigninResponseSchema);
export const SigninUpdateResponseSchema =
  updateResponseSchema(SigninResponseSchema);
export const SigninActivateResponseSchema = actionResponseSchema();
export const SigninDeactivateResponseSchema = actionResponseSchema();
export const SigninPageResponseSchema = pageResponseSchema(SigninSummarySchema);
