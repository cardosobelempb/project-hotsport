import z from "zod";

export enum OrganizationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export const OrganizationStatusShema = z.enum(OrganizationStatus);
