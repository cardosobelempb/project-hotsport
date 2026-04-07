import { EmailString } from "@/shared/schemas/helpers";
import z from "zod";

export const AuthForgotPasswordSchema = z.object({
  email: EmailString,
});

export type AuthForgotPasswordType = z.infer<typeof AuthForgotPasswordSchema>;
