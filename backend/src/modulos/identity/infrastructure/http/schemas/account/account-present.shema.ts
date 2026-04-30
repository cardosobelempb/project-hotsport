import { UUIDString } from "@/schemas/helpers";
import { ErrorSchema } from "@/shared/schemas/error";
import z from "zod";

export const AccountBaseSchema = z.object({
  id: UUIDString,
  accountId: UUIDString,
  provider: z.string(),
  providerAccountId: UUIDString,
  passwordHash: z.string(),
  createdAt: z.string(),
});

export const AccountCreatePresentSchema = {
  201: AccountBaseSchema,
  400: ErrorSchema,
  409: ErrorSchema,
  422: ErrorSchema,
  500: ErrorSchema,
} as const;

export const AccountUpdatePresentSchema = {
  200: AccountBaseSchema,
  404: ErrorSchema,
  409: ErrorSchema,
  422: ErrorSchema,
  500: ErrorSchema,
} as const;

export const AccountFindByIdPresentSchema = {
  200: AccountBaseSchema,
  404: ErrorSchema,
  422: ErrorSchema,
  500: ErrorSchema,
} as const;
