// ============================================================
// address.schema.ts
// Schemas exclusivos da entidade Address.
// Importa dos shared — zero duplicação de erros/paginação.
// ============================================================

import { z } from "zod";

import { AddressType } from "@/common/shared/enums/address-type.enum";
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

export const AddressParamsSchema = z.object({
  addressId: UUIDString,
});

export type AddressParams = z.infer<typeof AddressParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────
//
// Fonte única de verdade para todos os schemas derivados.
//
// ⚠️  z.nativeEnum() — obrigatório para enums TypeScript.
//     z.enum() só aceita tuplas de string literal ["A","B"],
//     não enums compilados. Usar z.enum(EnumTS) quebra em runtime.

export const AddressSchema = z
  .object({
    id: UUIDString.nullable(),
    userId: UUIDString.nullable(),
    tenantId: UUIDString.nullable(),
    organizationId: UUIDString.nullable(),

    addressType: z.enum(AddressType).default(AddressType.HOME),

    street: z.string().max(255).nullable(),
    addressNumber: z.string().max(255).nullable(),
    complement: z.string().max(255).nullable(),
    neighborhood: z.string().max(255).nullable(),
    reference: z.string().max(255).nullable(),

    cityId: UUIDString.nullable(),
    stateId: UUIDString.nullable(),

    zipCode: z.string().max(255).nullable(),
    country: z.string().max(255).nullable(),

    isPrimary: z.boolean().default(false),

    createdAt: IsoDateTimeInput.nullable(),
    updatedAt: IsoDateTimeInput.nullable(),
    deletedAt: IsoDateTimeInput.nullable(),
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

// Payload de criação: sem campos gerados pelo servidor
export const CreateAddressSchema = AddressSchema.omit({
  id: true,
  userId: true,
  tenantId: true,
  organizationId: true,
  addressType: true, // Deixa o cliente usar o enum, mas o servidor tem um default
  isPrimary: true, // O cliente não decide se é primário — o servidor define isso
  country: true, // O país é opcional — o cliente pode omitir, mas não pode enviar null ou string vazia
  cityId: true,
  stateId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Payload de atualização: todos os campos opcionais
// Não precisa de .strict() extra — já herdado do AddressSchema base
export const UpdateAddressSchema = AddressSchema.partial();

// ─── Response schemas (saída) ─────────────────────────────────────────────────

// Resposta completa: expõe tudo exceto campos de soft-delete
export const AddressResponseSchema = AddressSchema.omit({
  deletedAt: true,
  updatedAt: true,
});

// Resumo para listagem: versão compacta — evita over-fetching
export const AddressSummarySchema = AddressSchema.pick({
  id: true,
  street: true,
  neighborhood: true,
  complement: true,
  addressType: true,
  addressNumber: true,
});

// ─── Response wrappers via factory ───────────────────────────────────────────
//
// Cada wrapper envelopa AddressResponseSchema (entidade completa),
// não o schema de input — a resposta de create/update devolve a entidade
// persistida, não o payload que o cliente enviou.

export const AddressCreateResponseSchema = createResponseSchema(
  AddressResponseSchema,
);
export const AddressFindByIdResponseSchema = findResponseSchema(
  AddressResponseSchema,
);
export const AddressUpdateResponseSchema = updateResponseSchema(
  AddressResponseSchema,
);
export const AddressActivateResponseSchema = actionResponseSchema();
export const AddressDeactivateResponseSchema = actionResponseSchema();
export const AddressPageResponseSchema =
  pageResponseSchema(AddressSummarySchema);
