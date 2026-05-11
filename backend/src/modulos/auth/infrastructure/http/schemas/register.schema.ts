// ============================================================
// Register.schema.ts
// Schemas exclusivos da entidade Register.
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
import { UuidSchema } from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const RegisterParamsSchema = z.object({
  RegisterId: UUIDString,
});

export type RegisterParams = z.infer<typeof RegisterParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const RegisterSchema = z
  .object({
    id: UuidSchema,
    name: s.slug,
    email: s.email,
    password: s.password,
    tenantName: s.string,
    tenantSlug: s.slug,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateRegisterSchema = RegisterSchema.omit({
  id: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do RegisterSchema base
export const UpdateRegisterSchema = RegisterSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const RegisterResponseSchema = RegisterSchema.omit({});

// Resumo para listagem: versão compacta — evita over-fetching
export const RegisterSummarySchema = RegisterSchema.pick({
  id: true,
  name: true,
  email: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa RegisterResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const RegisterCreateResponseSchema = createResponseSchema(
  RegisterResponseSchema,
);
export const RegisterFindByIdResponseSchema = findResponseSchema(
  RegisterResponseSchema,
);
export const RegisterUpdateResponseSchema = updateResponseSchema(
  RegisterResponseSchema,
);
export const RegisterActivateResponseSchema = actionResponseSchema();
export const RegisterDeactivateResponseSchema = actionResponseSchema();
export const RegisterPageResponseSchema = pageResponseSchema(
  RegisterSummarySchema,
);
