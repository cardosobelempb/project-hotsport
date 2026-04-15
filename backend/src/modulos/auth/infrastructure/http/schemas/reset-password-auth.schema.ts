import { EmailString } from "@/shared/schemas/helpers";
import z from "zod";

export const AuthResetPasswordSchema = z.object({
  email: EmailString,
  password: z.string().min(1),
  token: z.string(),
});

export type AuthResetPasswordType = z.infer<typeof AuthResetPasswordSchema>;
