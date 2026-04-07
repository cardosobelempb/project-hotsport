import z from "zod";

import {
  UserPresentSchema,
  UserRegisterBodySchema,
} from "@/modulos/user/infrastructure/schemas/user-register.schema";
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

export const AuthRegisterPresentSchema = z.object({
  user: UserPresentSchema,
  // accessToken: z.string(),
});

export type AuthRegisterBodyType = z.infer<typeof AuthRegisterBodySchema>;
export type AuthRegisterPresentType = z.infer<typeof AuthRegisterPresentSchema>;
