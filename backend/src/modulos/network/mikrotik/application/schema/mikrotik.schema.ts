// ============================================================
// mikrotik.schema.ts
// Schemas exclusivos da entidade Mikrotik.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";

import { MikrotikStatus } from "@/common/shared/enums/mikrotik-status.enum";
import { NullableDate } from "@/common/shared/lib/schemas/dates.schema";
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

export const MikrotikParamsSchema = z.object({
  mikrotikId: UuidSchema.describe("ID do Mikrotik (UUID)"),
});

export type MikrotikParams = z.infer<typeof MikrotikParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const MikrotikSchema = z
  .object({
    id: UuidSchema.describe("ID do Mikrotik (UUID)"),
    organizationId: UuidSchema.describe("ID da organização associada (UUID)"),
    name: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .describe("Nome do Mikrotik"),
    username: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .describe("Nome de usuário para acesso ao Mikrotik"),
    passwordHash: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .describe("Hash da senha para acesso ao Mikrotik"),
    host: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .describe("Endereço do host (IP ou domínio)"),
    port: z
      .number()
      .int()
      .positive()
      .default(8728)
      .describe("Porta de acesso ao Mikrotik (padrão: 8728)"),
    macAddress: z
      .string()
      .max(20)
      .describe("Endereço MAC do Mikrotik (opcional)"),
    ipAddress: z
      .string()
      .max(45)
      .describe("Endereço IP do Mikrotik (opcional)"),
    activeUser: z
      .boolean()
      .default(false)
      .describe("Indica se o usuário está ativo (padrão: false)"),
    status: z
      .enum(MikrotikStatus)
      .default(MikrotikStatus.OFFLINE)
      .describe("Status atual do Mikrotik"),
    createdAt: s.date.describe("Data de criação do registro"),
    updatedAt: NullableDate.describe("Data da última atualização do registro"),
    deletedAt: NullableDate.describe(
      "Data de exclusão (soft delete) do registro",
    ),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateMikrotikSchema = MikrotikSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do MikrotikSchema base
export const UpdateMikrotikSchema = MikrotikSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const MikrotikResponseSchema = MikrotikSchema.omit({
  passwordHash: true, // Nunca exponha hashes de senha em respostas HTTP!
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const MikrotikSummarySchema = MikrotikSchema.pick({
  id: true,
  organizationId: true,
  username: true,
  host: true,
  port: true,
  activeUser: true,
  status: true,
  createdAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa MikrotikResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const MikrotikCreateResponseSchema = createResponseSchema(
  MikrotikSummarySchema,
);

export const MikrotikFindByIdResponseSchema = findResponseSchema(
  MikrotikResponseSchema,
);
export const MikrotikUpdateResponseSchema = updateResponseSchema(
  MikrotikResponseSchema,
);
export const MikrotikActivateResponseSchema = actionResponseSchema();
export const MikrotikDeactivateResponseSchema = actionResponseSchema();
export const MikrotikPageResponseSchema = pageResponseSchema(
  MikrotikSummarySchema,
);
