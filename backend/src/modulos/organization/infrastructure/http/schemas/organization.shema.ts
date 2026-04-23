import { OrganizationStatus } from "@/modulos/organization/domain/enums/organization.enum";
import { IsoDateTimeInput } from "@/shared/schemas/helpers";
import z from "zod";

export const OrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  logoUrl: z.string().url("Logo URL must be a valid URL").nullable(),
  status: z.enum(OrganizationStatus),
  createdAt: IsoDateTimeInput,
  updatedAt: IsoDateTimeInput.nullable(),
  deletedAt: IsoDateTimeInput.nullable(),
});

export const OrganizationParamsSchema = z.object({
  organizationId: z.string("Id is required").uuid(),
});

export type OrganizationParams = z.infer<typeof OrganizationParamsSchema>;

export type OrganizationPresentDto = z.infer<typeof OrganizationSchema>;
