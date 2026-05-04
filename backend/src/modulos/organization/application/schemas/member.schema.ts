// ============================================================
// member.schema.ts
// Schemas exclusivos da entidade Member.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { MemberInvitationStatus } from "@/shared/enums/member-invitation-status.enum";
import { MemberRole } from "@/shared/enums/member-role.enum";
import { MemberStatus } from "@/shared/enums/member-status.enum";
import { IsoDateTimeInput, UUIDString } from "@/shared/schemas/helpers";
import {
  actionResponseSchema,
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/shared/schemas/response.factory";

// ─── Params ───────────────────────────────────────────────────────────────────

export const MemberParamsSchema = z.object({
  memberId: UUIDString,
});

export type MemberParams = z.infer<typeof MemberParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const MemberSchema = z
  .object({
    id: UUIDString,
    organizationId: UUIDString,
    userId: UUIDString,
    email: z.string().email(),
    invitedBy: UUIDString.nullable(),
    role: z.enum(MemberRole),
    status: z.enum(MemberStatus),
    invitationStatus: z.enum(MemberInvitationStatus),
    joinedAt: IsoDateTimeInput.nullable(),
    expiresAt: IsoDateTimeInput.nullable(),
    createdAt: IsoDateTimeInput.nullable(),
    updatedAt: IsoDateTimeInput.nullable(),
    deletedAt: IsoDateTimeInput.nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateMemberSchema = MemberSchema.omit({
  id: true,
  status: true,

  joinedAt: true,
  expiresAt: true,
  invitationStatus: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do MemberSchema base
export const UpdateMemberSchema = MemberSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const MemberResponseSchema = MemberSchema.omit({
  updatedAt: true,
  deletedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const MemberSummarySchema = MemberSchema.pick({
  id: true,
  organizationId: true,
  userId: true,
  role: true,
  status: true,
  email: true,
  invitationStatus: true,
  joinedAt: true,
  createdAt: true,
  expiresAt: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa MemberResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const MemberCreateResponseSchema =
  createResponseSchema(MemberResponseSchema);
export const MemberFindByIdResponseSchema =
  findResponseSchema(MemberResponseSchema);
export const MemberUpdateResponseSchema =
  updateResponseSchema(MemberResponseSchema);
export const MemberActivateResponseSchema = actionResponseSchema();
export const MemberDeactivateResponseSchema = actionResponseSchema();
export const MemberPageResponseSchema = pageResponseSchema(MemberSummarySchema);

// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

export type MemberDto = z.infer<typeof MemberSchema>;
export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;
export type MemberSummaryDto = z.infer<typeof MemberSummarySchema>;
export type MemberResponseDto = z.infer<typeof MemberResponseSchema>;
export type MemberCreateResponseDto = z.infer<
  typeof MemberCreateResponseSchema
>;
export type MemberFindByIdResponseDto = z.infer<
  typeof MemberFindByIdResponseSchema
>;
export type MemberUpdateResponseDto = z.infer<
  typeof MemberUpdateResponseSchema
>;
export type MemberActivateResponseDto = z.infer<
  typeof MemberActivateResponseSchema
>;
export type MemberDeactivateResponseDto = z.infer<
  typeof MemberDeactivateResponseSchema
>;
export type MemberPageResponseDto = z.infer<typeof MemberPageResponseSchema>;
