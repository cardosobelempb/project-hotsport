import z from "zod";

export const OrganizationStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
]);
