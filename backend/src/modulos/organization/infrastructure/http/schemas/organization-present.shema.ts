import { OrganizationStatus } from "@/modulos/organization/domain/enums/organization.enum";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import z from "zod";

export const OrganizationResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  status: z.enum(OrganizationStatus),
  createdAt: z.string(),
});

export const OrganizationPresentSchema = z.object({
  200: OrganizationResponseSchema,
  404: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
});
