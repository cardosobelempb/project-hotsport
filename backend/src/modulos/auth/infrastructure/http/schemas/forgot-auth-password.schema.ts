import { EmailString } from "@/common/shared/schemas/helpers";
import z from "zod";

export const AuthForgotPasswordSchema = z.object({
  email: EmailString,
});

export type AuthForgotPasswordType = z.infer<typeof AuthForgotPasswordSchema>;
