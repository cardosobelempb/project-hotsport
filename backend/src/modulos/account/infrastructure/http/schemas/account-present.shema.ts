import { UUIDString } from "@/schemas/helpers";
import { HttpErrorSchema } from "@/shared/schemas/error";
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
  400: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
} as const;

export const AccountUpdatePresentSchema = {
  200: AccountBaseSchema,
  404: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
} as const;

export const AccountFindByIdPresentSchema = {
  200: AccountBaseSchema,
  404: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
} as const;
