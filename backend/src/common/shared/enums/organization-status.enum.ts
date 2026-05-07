import z from "zod";

export enum OrganizationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export const OrganizationStatusShema = z.enum(OrganizationStatus);
