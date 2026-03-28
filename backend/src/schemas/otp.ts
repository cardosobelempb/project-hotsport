import { z } from "zod";

import {
  CpfString,
  IsoDateTimeString,
  PhoneString,
  UUIDString,
} from "./helpers.js";

export const OtpRequestBodySchema = z.object({
  cpf: CpfString,
  phone: PhoneString,
});

export const OtpRequestResponseSchema = z.object({
  status: z.enum(["sent", "error"]),
  detail: z.string().optional(),
});

export const UserOtpSchema = z.object({
  id: UUIDString,
  userId: UUIDString,
  expiresAt: IsoDateTimeString,
  attempts: z.number().int(),
  used: z.boolean(),
  createdAt: IsoDateTimeString,
});

export const RequestOtpSchema = z.object({
  cpf: CpfString,
  phone: PhoneString,
  name: z.string().optional(),
});

export const VerifyOtpSchema = z.object({
  cpf: CpfString,
  otp: z.string().length(6),
});

export const VerifyOtpOutputSchema = z.object({
  verified: z.boolean(),
  userId: UUIDString,
  cpf: CpfString,
  name: z.string().nullable(),
  phone: PhoneString.nullable(),
  nextStep: z.enum(["login", "register", "entitlement"]),
});

export const OtpAuditEventSchema = z.enum([
  "otp_requested",
  "otp_sent",
  "otp_whatsapp_error",
  "otp_throttled",
  "otp_validation_error",
  "otp_request_error",
  "otp_verify_attempt",
  "otp_verified",
  "otp_invalid",
  "otp_max_attempts",
  "otp_not_found",
  "otp_user_not_found",
]);

export const OtpAuditLogSchema = z.object({
  id: z.number().int(),
  event: OtpAuditEventSchema,
  cpf: CpfString,
  phone: PhoneString.nullable(),
  ip: z.string().nullable(),
  detail: z.string().nullable(),
  createdAt: IsoDateTimeString,
});
