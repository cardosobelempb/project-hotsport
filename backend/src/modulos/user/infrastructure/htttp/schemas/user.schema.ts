import z from "zod";

import { UserStatusSchema } from "@/modulos/user/domain/enums/user-status.enum";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import {
  CpfString,
  EmailString,
  IsoDateTimeOutput,
  PasswordString,
  PhoneString,
  UUIDString,
  withPasswordConfirmation,
} from "@/shared/schemas/helpers";

// ── Base ──────────────────────────────────────────────────────────────────────

export const UserBaseSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: PhoneString,
  cpf: CpfString,
  email: EmailString,
  passwordHash: PasswordString,
  passwordConfirmation: PasswordString,
});

export const UserResponseSchema = z.object({
  id: UUIDString,
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: PhoneString,
  cpf: CpfString,
  email: EmailString,
  status: UserStatusSchema,
  createdAt: IsoDateTimeOutput,
});

// ── Body ──────────────────────────────────────────────────────────────────────

export const CreateUserBodySchema = withPasswordConfirmation(UserBaseSchema);

export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;

// ── Response ──────────────────────────────────────────────────────────────────

export const CreateUserUserSchema = z.object({
  id: UUIDString,
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: PhoneString,
  cpf: CpfString,
  email: EmailString,
  status: UserStatusSchema,
  createdAt: IsoDateTimeOutput,
  // updatedAt: z.string().datetime(),
});

export const CreateUserResponseSchema = {
  201: CreateUserUserSchema,
  409: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
};

export type CreateUserResponseType = z.infer<
  (typeof CreateUserResponseSchema)[201]
>;
