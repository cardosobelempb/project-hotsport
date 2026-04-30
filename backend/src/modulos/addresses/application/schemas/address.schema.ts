import { ValidatorMessage } from "@/common/domain/validations";
import { z } from "zod";

export const createAddressSchema = z
  .object({
    establishmentId: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .uuid()
      .optional(),
    userId: z.string(ValidatorMessage.REQUIRED_FIELD).uuid().optional(),
    customerId: z.string(ValidatorMessage.REQUIRED_FIELD).uuid().optional(),
    stateId: z.string(ValidatorMessage.REQUIRED_FIELD).uuid().optional(),
    cityId: z.string(ValidatorMessage.REQUIRED_FIELD).uuid().optional(),
    stateLegacy: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    cityLegacy: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    zipCode: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    addressNumber: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    neighborhood: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    street: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    complement: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
    reference: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .max(255, ValidatorMessage.MAX_VALUE)
      .optional(),
  })
  .strict();

export const updateAddressSchema = createAddressSchema.partial().strict();

export const addressPresenterSchema = createAddressSchema
  .extend({
    id: z.string(ValidatorMessage.REQUIRED_FIELD).uuid(),
  })
  .strict();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressPresenter = z.infer<typeof addressPresenterSchema>;

export const createAddressRawExample: CreateAddressInput = {
  establishmentId: "550e8400-e29b-41d4-a716-446655440000",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  customerId: "550e8400-e29b-41d4-a716-446655440002",
  stateId: "550e8400-e29b-41d4-a716-446655440003",
  cityId: "550e8400-e29b-41d4-a716-446655440004",
  street: "Rua Exemplo",
  addressNumber: "100",
};

export const addressPresenterRawExample: AddressPresenter = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  ...createAddressRawExample,
};
