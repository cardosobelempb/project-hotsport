import z from "zod";

import { UserResponseSchema } from "@/modulos/user/infrastructure/htttp/schemas/user.schema";
import { ErrorSchema } from "@/shared/schemas/error";

export const AuthSessionResponseSchema = {
  200: z.object({ user: UserResponseSchema }),
  401: ErrorSchema,
  500: ErrorSchema,
};

export type AuthSessionResponseType = z.infer<
  (typeof AuthSessionResponseSchema)[200]
>;
