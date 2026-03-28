import { z } from "zod";

export const EmailString = z.email("Invalid email address");
export const UUIDString = z.uuid("Invalid UUID format");
export const IsoDateTimeString = z
  .string()
  .datetime("Invalid ISO date-time format");
export const CpfString = z
  .string()
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF must have 11 digits");
export const PhoneString = z
  .string()
  .regex(/^\+?[\d\s\-().]{10,20}$/, "Invalid phone number");

export type EmailStringType = z.infer<typeof EmailString>;
export type UUIDStringType = z.infer<typeof UUIDString>;
export type IsoDateTimeStringType = z.infer<typeof IsoDateTimeString>;
export type CpfStringType = z.infer<typeof CpfString>;
export type PhoneStringType = z.infer<typeof PhoneString>;
