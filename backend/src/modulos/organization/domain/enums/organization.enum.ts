import z from "zod";

export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export const OrganizationStatusShema = z.enum(OrganizationStatus);
