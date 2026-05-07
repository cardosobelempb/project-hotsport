// ─────────────────────────────────────────────────────────────
// 🧱 Reusable string primitives
// Build once, use everywhere across the project
// ─────────────────────────────────────────────────────────────

import z from "zod";

// — IDs -------------------------------------------------------
export const UuidSchema = z.uuid({ message: "Invalid ID format" });
export const CuidSchema = z.cuid();
export const Cuid2Schema = z.cuid2();

// — Contact ---------------------------------------------------
export const EmailSchema = z
  .string()
  .email({ message: "Invalid email address" })
  .toLowerCase() // normalizes before saving — avoids "User@mail.com" != "user@mail.com"
  .trim(); // removes accidental leading/trailing spaces

export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, { message: "Invalid phone number" })
  .transform((phone) => phone.replace(/\D/g, "")); // strips masks → stores digits only

// — Documents (Brazil) ----------------------------------------
export const CpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, { message: "Invalid CPF" })
  .transform((cpf) => cpf.replace(/\D/g, "")); // stores digits only: "12345678901"

export const ZipCodeSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, { message: "Invalid ZIP code" })
  .transform((zip) => zip.replace("-", "")); // stores digits only: "01310100"

// — Web -------------------------------------------------------
export const UrlSchema = z.string().url({ message: "Invalid URL" });
export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Invalid slug format" })
  .min(3)
  .max(100);

// — Free text -------------------------------------------------
export const NameSchema = z
  .string()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(100, { message: "Name must be at most 100 characters" })
  .trim()
  .transform((name) => name.replace(/\s+/g, " ")); // collapses double spaces

export const BioSchema = z
  .string()
  .max(500, { message: "Bio cannot exceed 500 characters" })
  .nullable()
  .optional();

// ─────────────────────────────────────────────────────────────
// 🔄 Transform: clean and normalize strings on input
// Avoids dirty data in the DB without extra code in the service
// ─────────────────────────────────────────────────────────────
export const CodeSchema = z
  .string()
  .toUpperCase() // normalize to uppercase before validation
  .trim() // remove surrounding whitespace
  .min(4)
  .max(10);

// Usage:
CodeSchema.parse("  abc123  "); // → 'ABC123' ✅

// ─────────────────────────────────────────────────────────────
// ✅ Usage examples
// ─────────────────────────────────────────────────────────────

// Email normalization
// EmailSchema.parse("  JOHN@EMAIL.COM  "); // → 'john@email.com' ✅

// Phone stripping
// PhoneSchema.parse("+55 (11) 91234-5678"); // → '5511912345678' ✅

// CPF stripping
// CpfSchema.parse("123.456.789-09"); // → '12345678909' ✅

// Slug validation
// SlugSchema.parse("my-awesome-post-2024"); // ✅
// SlugSchema.parse("My Awesome Post"); // ❌ invalid slug
