import z from "zod";

import { UserStatusSchema } from "@/modulos/identity/application/dto/user/user-status.enum";

import { ErrorSchema } from "@/shared/schemas/error";
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

const CreateAccountBase = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: PhoneString,
  cpf: CpfString,
  email: EmailString,
  passwordHash: PasswordString,
  passwordConfirmation: PasswordString,
});

// ── Body ──────────────────────────────────────────────────────────────────────

export const CreateAccountBodySchema =
  withPasswordConfirmation(CreateAccountBase);

export type CreateAccountBodyType = z.infer<typeof CreateAccountBodySchema>;

// ── Response ──────────────────────────────────────────────────────────────────

export const CreateAccountUserSchema = z.object({
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

export const CreateAccountResponseSchema = {
  201: CreateAccountUserSchema,
  409: ErrorSchema,
  422: ErrorSchema,
  500: ErrorSchema,
};

// export type CreateAccountResponseType = z.infer<
//   (typeof CreateAccountResponseSchema)[201]
// >;
