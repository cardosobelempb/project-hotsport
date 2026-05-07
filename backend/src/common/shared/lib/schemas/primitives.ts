// src/lib/schemas/primitives.ts
// ─────────────────────────────────────────────────────────────
// 🧱 Drop this file into any project and import what you need
// Single source of truth — extend per domain as needed
// ─────────────────────────────────────────────────────────────
import { z } from "zod";

export const s = {
  // — IDs -------------------------------------------------------
  uuid: z.string().uuid(),
  cuid: z.string().cuid(),

  // — Text ------------------------------------------------------
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/)
    .transform((v) => v.replace(/\D/g, "")),
  url: z.string().url(),
  password: z.string().min(8).max(72),

  // — Numbers ---------------------------------------------------
  price: z.number().positive().multipleOf(0.01),
  percentage: z.number().min(0).max(100),
  quantity: z.number().int().nonnegative(),
  rating: z.number().int().min(1).max(5),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // — Dates -----------------------------------------------------
  date: z.coerce.date(),
  nullableDate: z.coerce.date().nullable(),
  optionalDate: z.coerce.date().optional(),

  // — Misc ------------------------------------------------------
  active: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()),
} as const;

// Usage anywhere in the project:
// import { s } from '@/lib/schemas/primitives'
//
// const UserSchema = z.object({
//   id:    s.uuid,
//   name:  s.name,
//   email: s.email,
//   price: s.price,
// })
