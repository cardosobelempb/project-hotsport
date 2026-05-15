// ─── Tipos inferidos ──────────────────────────────────────────────────────────
//
// Nunca escreva tipos manualmente — inferidos diretamente dos schemas.
// Se o schema mudar, o tipo muda junto automaticamente.

import z from "zod";
import {
  AddressActivateResponseSchema,
  AddressCreateResponseSchema,
  AddressDeactivateResponseSchema,
  AddressFindByIdResponseSchema,
  AddressPageResponseSchema,
  AddressResponseSchema,
  AddressSchema,
  AddressSummarySchema,
  AddressUpdateResponseSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
} from "../schemas/address.schema";

export type AddressDto = z.infer<typeof AddressSchema>;
export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
export type AddressSummaryDto = z.infer<typeof AddressSummarySchema>;
export type AddressResponseDto = z.infer<typeof AddressResponseSchema>;
export type AddressCreateResponseDto = z.infer<
  typeof AddressCreateResponseSchema
>;
export type AddressFindByIdResponseDto = z.infer<
  typeof AddressFindByIdResponseSchema
>;
export type AddressUpdateResponseDto = z.infer<
  typeof AddressUpdateResponseSchema
>;
export type AddressActivateResponseDto = z.infer<
  typeof AddressActivateResponseSchema
>;
export type AddressDeactivateResponseDto = z.infer<
  typeof AddressDeactivateResponseSchema
>;
export type AddressPageResponseDto = z.infer<typeof AddressPageResponseSchema>;
