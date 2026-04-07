import { z } from "zod";

export const EmailString = z.string().email("Invalid email address");
export const UUIDString = z.string().uuid("Invalid UUID format");
// ✅ Para INPUT (body) — aceita Date ou string e transforma
export const IsoDateTimeInput = z
  .union([z.string(), z.date()])
  .transform((val) => (val instanceof Date ? val.toISOString() : val));

// ✅ Para OUTPUT (response) — sempre string pura, sem union/transform
export const IsoDateTimeOutput = z.string().datetime({ offset: true });

export const CpfString = z
  .string()
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF must have 11 digits");
export const PhoneString = z
  .string()
  .regex(/^\+?[\d\s\-().]{10,20}$/, "Invalid phone number");

export type EmailStringType = z.infer<typeof EmailString>;
export type UUIDStringType = z.infer<typeof UUIDString>;
export type IsoDateTimeInputType = z.infer<typeof IsoDateTimeInput>;
export type IsoDateTimeOutputType = z.infer<typeof IsoDateTimeOutput>;
export type CpfStringType = z.infer<typeof CpfString>;
export type PhoneStringType = z.infer<typeof PhoneString>;

export const parseEnvArray = (value: string): string[] => {
  return value.split(",").map((item) => item.trim());
};
