import { OrganizationStatusShema } from "@/modulos/organization/domain/enums/organization.enum";
import { UUIDString } from "@/schemas/helpers";
import { HttpErrorSchema } from "@/shared/schemas/error";
import z from "zod";

export const OrganizationBaseSchema = z.object({
  id: UUIDString,
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  status: OrganizationStatusShema,
  createdAt: z.string(),
});

export const OrganizationCreatePresentSchema = {
  201: OrganizationBaseSchema,
  400: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
  default: HttpErrorSchema,
} as const;

export const OrganizationFindByIdPresentSchema = {
  200: OrganizationBaseSchema,
  404: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
  default: HttpErrorSchema,
} as const;

export const OrganizationUpdatePresentSchema = {
  200: OrganizationBaseSchema,
  404: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
  default: HttpErrorSchema,
} as const;

export const OrganizationActivatePresentSchema = {
  200: z.object({ message: z.string() }),
  404: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
  default: HttpErrorSchema,
} as const;

export const OrganizationDeactivatePresentSchema = {
  200: z.object({ message: z.string() }),
  404: HttpErrorSchema,
  409: HttpErrorSchema,
  422: HttpErrorSchema,
  500: HttpErrorSchema,
  default: HttpErrorSchema,
} as const;
