import z from "zod";

import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import {
  IsoDateTimeOutput,
  PasswordString,
  UUIDString,
  withPasswordConfirmation,
} from "@/shared/schemas/helpers";
import { MikrotikStatusSchema } from "../../../domain/emuns/mikrotik-status.enum";

// ── Base ──────────────────────────────────────────────────────────────────────

const MikrotikShema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  host: z.string().min(1, "Host is required"),
  port: z.number().int().positive("Port must be a positive integer"),
  ipAddress: z.string().min(1, "IP Address is required"),
  macAddress: z.string().min(1, "MAC Address is required"),
  passwordHash: PasswordString,
  organizationId: UUIDString,
});

// ── Body ──────────────────────────────────────────────────────────────────────
export const MikrotikBodySchema = MikrotikShema;
export const CreateMikrotikBodySchema = withPasswordConfirmation(MikrotikShema);

export type CreateMikrotikBodyType = z.infer<typeof CreateMikrotikBodySchema>;

// ── Response ──────────────────────────────────────────────────────────────────

export const CreateMikrotikMikrotikSchema = z.object({
  id: UUIDString,
  name: z.string(),
  host: z.string(),
  port: z.number().int(),
  ipAddress: z.string(),
  macAddress: z.string(),
  username: z.string(),
  passwordHash: PasswordString,
  organizationId: UUIDString,
});

export const MikrotikResponseSchema = z.object({
  id: UUIDString,
  name: z.string(),
  host: z.string(),
  port: z.number().int(),
  ipAddress: z.string(),
  macAddress: z.string(),
  username: z.string(),
  status: MikrotikStatusSchema,
  createdAt: IsoDateTimeOutput,
  organizationId: UUIDString,
});

export const CreateMikrotikResponseSchema = {
  201: MikrotikResponseSchema,
  409: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
};

export type CreateMikrotikResponseType = z.infer<
  (typeof CreateMikrotikResponseSchema)[201]
>;
