import {
  EmailString,
  IsoDateTimeInput,
  UUIDString,
} from "@/shared/schemas/helpers";
import { z } from "zod";

export const AuthSchema = z.object({
  id: UUIDString,
  authId: UUIDString,
  email: EmailString,
  passwordHash: z.string().nullable(),
  createdAt: IsoDateTimeInput,
});

// export const AuthPresentSchema = AuthSchema.omit({
//   passwordHash: true,
// });

// export const AuthResponseSchema = AuthSchema.omit({
//   passwordHash: true,
// });

// export const JwtMeOutputSchema = z.object({
//   sub: z.string(),
//   role: z.string().optional(),
// });

// export type AuthType = z.infer<typeof AuthSchema>;
// export type AuthPresentType = z.infer<typeof AuthPresentSchema>;
// export type JwtMeOutputType = z.infer<typeof JwtMeOutputSchema>;
// export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;

import { UserResponseSchema } from "@/modulos/user/infrastructure/schemas/user.schema";
import { ErrorSchema } from "@/shared/schemas/error";

export const AuthResponseSchema = {
  200: z.object({ user: UserResponseSchema }),
  401: ErrorSchema,
  500: ErrorSchema,
};

export type AuthResponseType = z.infer<(typeof AuthResponseSchema)[200]>;
