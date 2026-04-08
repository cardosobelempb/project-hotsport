import z from "zod";

import { ConflictError } from "@/core";
import { UserRegisterBodySchema } from "@/modulos/user/infrastructure/schemas/user-register.schema";
import { UserResponseSchema } from "@/modulos/user/infrastructure/schemas/user.schema";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import { EmailString } from "@/shared/schemas/helpers";

const AuthRegisterBaseSchema = z.object({
  user: UserRegisterBodySchema, // ✅ nunca use schema com .refine() aninhado
  email: EmailString,
  password: z.string().min(6, "Password must be at least 6 characters"),
  passwordConfirmation: z
    .string()
    .min(6, "Password confirmation must be at least 6 characters"),
});

export const AuthRegisterBodySchema = AuthRegisterBaseSchema.refine(
  (data) => data.password === data.passwordConfirmation,
  {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  },
);
export type AuthRegisterBodyType = z.infer<typeof AuthRegisterBodySchema>;

export const AuthRegisterResponseSchema = {
  201: { user: UserResponseSchema },
  409: ConflictError,
  422: ValidationErrorSchema,
  500: ErrorSchema,
};

export type AuthRegisterResponseType = z.infer<
  (typeof AuthRegisterResponseSchema)[201]
>;
