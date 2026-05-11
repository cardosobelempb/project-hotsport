// src/lib/schemas/primitives.ts
// ─────────────────────────────────────────────────────────────
// 🧱 Drop this file into any project and import what you need
// Single source of truth — extend per domain as needed
// ─────────────────────────────────────────────────────────────
import { ValidatorMessage } from "@/common/domain/validations/ValidatorMessage";
import { z } from "zod";

export const s = {
  // — IDs -------------------------------------------------------
  uuid: z
    .string(ValidatorMessage.REQUIRED_FIELD)
    .uuid(ValidatorMessage.INVALID_FORMAT),
  cuid: z
    .string(ValidatorMessage.REQUIRED_FIELD)
    .cuid(ValidatorMessage.INVALID_FORMAT),
  // — Text ------------------------------------------------------
  string: z.string(ValidatorMessage.REQUIRED_FIELD).min(2).max(100).trim(),
  description: z.string(ValidatorMessage.REQUIRED_FIELD).max(500).trim(),
  name: z.string(ValidatorMessage.REQUIRED_FIELD).min(2).max(100).trim(),

  // - Text short text and long text --------------------------------------
  shortText: z.string(ValidatorMessage.REQUIRED_FIELD).min(2).max(100).trim(),
  longText: z.string(ValidatorMessage.REQUIRED_FIELD).max(500).trim(),
  // — Contact ---------------------------------------------------
  hash: z.string(ValidatorMessage.REQUIRED_FIELD).min(32).max(255).trim(),
  token: z.string(ValidatorMessage.REQUIRED_FIELD).min(32).max(255).trim(),
  email: z.string(ValidatorMessage.REQUIRED_FIELD).email().toLowerCase().trim(),

  slug: z
    .string(ValidatorMessage.REQUIRED_FIELD)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  phone: z
    .string(ValidatorMessage.REQUIRED_FIELD)
    .regex(/^\+?[1-9]\d{7,14}$/)
    .transform((v) => v.replace(/\D/g, "")),
  url: z.string(ValidatorMessage.REQUIRED_FIELD).url(),
  password: z.string(ValidatorMessage.REQUIRED_FIELD).min(8).max(72),

  // network
  mac: z.mac({ error: ValidatorMessage.REQUIRED_FIELD }),
  ipv4: z.ipv4({ error: ValidatorMessage.REQUIRED_FIELD }),
  ipv6: z.ipv6({ error: ValidatorMessage.REQUIRED_FIELD }),

  // — Numbers ---------------------------------------------------
  number: z.number(ValidatorMessage.REQUIRED_FIELD),
  price: z.number(ValidatorMessage.REQUIRED_FIELD).positive().multipleOf(0.01),
  percentage: z.number(ValidatorMessage.REQUIRED_FIELD).min(0).max(100),
  quantity: z.number(ValidatorMessage.REQUIRED_FIELD).int().nonnegative(),
  rating: z.number(ValidatorMessage.REQUIRED_FIELD).int().min(1).max(5),
  page: z.coerce
    .number(ValidatorMessage.REQUIRED_FIELD)
    .int()
    .positive()
    .default(1),
  limit: z.coerce
    .number(ValidatorMessage.REQUIRED_FIELD)
    .int()
    .min(1)
    .max(100)
    .default(20),

  // — Dates -----------------------------------------------------
  date: z.coerce.date(ValidatorMessage.REQUIRED_FIELD),
  nullableDate: z.coerce.date(ValidatorMessage.REQUIRED_FIELD).nullable(),
  optionalDate: z.coerce.date(ValidatorMessage.REQUIRED_FIELD).optional(),

  // — Misc ------------------------------------------------------
  active: z.boolean(ValidatorMessage.REQUIRED_FIELD).default(true),
  metadata: z.record(z.string(ValidatorMessage.REQUIRED_FIELD), z.unknown()),

  // Boolean flags
  isActive: z.boolean(ValidatorMessage.REQUIRED_FIELD).default(true),
  isVerified: z.boolean(ValidatorMessage.REQUIRED_FIELD).default(false),
} as const;

// Usage anywhere in the project:
// import { s } from '@/lib/schemas/primitives'
//import { ValidatorMessage } from '@/common/domain/validations/ValidatorMessage';

// const UserSchema = z.object({
//   id:    s.uuid,
//   name:  s.name,
//   email: s.email,
//   price: s.price,
// })
