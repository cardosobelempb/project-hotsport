import {
  ErrorSchema,
  ValidationErrorSchema,
} from "@/common/shared/schemas/error";
import { EmailString } from "@/common/shared/schemas/helpers";
import z from "zod";

const AuthLoginBaseSchema = z.object({
  email: EmailString,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const AuthLoginBodySchema = AuthLoginBaseSchema.extend({});

export type AuthLoginResponseSchemaType = z.infer<
  typeof AuthLoginResponseSchema
>;
export type AuthLoginBodySchemaType = z.infer<typeof AuthLoginBodySchema>;

export const AuthLoginResponseSchema = {
  200: z.object({
    message: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  401: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
};

export type AuthLoginResponseType = z.infer<
  (typeof AuthLoginResponseSchema)[200]
>;
