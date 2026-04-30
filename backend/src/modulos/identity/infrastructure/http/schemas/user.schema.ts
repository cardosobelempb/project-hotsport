import { ValidatorMessage } from "@/common/domain/validations/validator-message";
import { UserStatus } from "@/shared/enums/user-status.enum";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";

import { IsoDateTimeInput } from "@/shared/schemas/helpers";
import z from "zod";

export const UserParamsSchema = z.object({
  userId: z.string("Id is required").uuid(),
});

export type UserParams = z.infer<typeof UserParamsSchema>;

export const userSchema = z
  .object({
    id: z.string(ValidatorMessage.REQUIRED_FIELD).uuid().optional(),
    firstName: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    lastName: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    slug: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    logoUrl: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .url(ValidatorMessage.INVALID_URL)
      .nullable(),
    email: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .email(ValidatorMessage.INVALID_EMAIL),
    cpf: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, ValidatorMessage.INVALID_FORMAT),
    phoneNumber: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .regex(/^\+?\d{10,15}$/, ValidatorMessage.INVALID_FORMAT)
      .optional()
      .nullable(),
    status: z.enum(UserStatus).optional(),
    createdAt: IsoDateTimeInput.optional(),
    updatedAt: IsoDateTimeInput.optional().nullable(),
    deletedAt: IsoDateTimeInput.optional().nullable(),
  })
  .strict();

export const createUserSchema = z
  .object({
    firstName: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    lastName: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    slug: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .min(1, ValidatorMessage.MIN_VALUE),
    logoUrl: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .url(ValidatorMessage.INVALID_URL)
      .nullable(),
    email: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .email(ValidatorMessage.INVALID_EMAIL),
    cpf: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, ValidatorMessage.INVALID_FORMAT),
    phoneNumber: z
      .string(ValidatorMessage.REQUIRED_FIELD)
      .regex(/^\+?\d{10,15}$/, ValidatorMessage.INVALID_FORMAT)
      .optional()
      .nonoptional(),
  })
  .strict();

export const updateUserSchema = userSchema.partial().strict();

export const userPresenterSchema = {
  201: { user: userSchema },
  409: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
};

export type UserDto = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserPresenterDto = z.infer<typeof userPresenterSchema>;

export const createUserRawExample: UserDto = {
  firstName: "John",
  lastName: "Doe",
  slug: "john-doe",
  logoUrl: null,
  email: "jondoe@email.com",
  cpf: "000.000.000-00",
  phoneNumber: "+5511999999999",
};

export const userPresenterRawExample: UserPresenterDto = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  ...createUserRawExample,
};
