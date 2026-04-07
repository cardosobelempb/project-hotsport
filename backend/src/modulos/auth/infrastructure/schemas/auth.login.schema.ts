import z from "zod";

import { UserPresentSchema } from "@/modulos/user/infrastructure/schemas/user-register.schema";
import { EmailString } from "@/shared/schemas/helpers";
import { AuthPresentSchema } from "./auth.schema";

const AuthLoginBaseSchema = z.object({
  email: EmailString,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const AuthLoginBodySchema = AuthLoginBaseSchema.extend({});

export const AuthLoginPresentSchema = AuthPresentSchema.extend({
  user: UserPresentSchema,
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

// export const AuthLoginPresentSchema = z.object({
//   user: UserPresentSchema,
//   auth: AuthPresentSchema,
//   accessToken: z.string(),
//   refreshToken: z.string().optional(),
// });

export type AuthLoginBodyType = z.infer<typeof AuthLoginBodySchema>;
export type AuthLoginPresentType = z.infer<typeof AuthLoginPresentSchema>;
