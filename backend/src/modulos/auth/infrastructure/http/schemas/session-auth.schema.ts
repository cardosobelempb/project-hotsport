import z from "zod";

import { userPresenterSchema } from "@/modulos/identity/infrastructure/http/schemas/user.schema";
import { ErrorSchema } from "@/shared/schemas/error";

export const AuthSessionResponseSchema = {
  200: z.object({ user: userPresenterSchema }),
  401: ErrorSchema,
  500: ErrorSchema,
};

export type AuthSessionResponseType = z.infer<
  (typeof AuthSessionResponseSchema)[200]
>;
