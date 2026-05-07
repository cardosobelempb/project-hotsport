// ─────────────────────────────────────────────────────────────
// 🔐 Modular regex — each rule separated for clarity
// Allows showing which specific criteria hasn't been met yet

import z from "zod";

// ─────────────────────────────────────────────────────────────
const PASSWORD_RULES = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  noSpaces: /^\S+$/,
} as const;

// ─────────────────────────────────────────────────────────────
// Base strong password schema
// Max 72 chars: bcrypt silently ignores anything beyond that!
// ─────────────────────────────────────────────────────────────
export const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be at most 72 characters" })
  .regex(PASSWORD_RULES.uppercase, {
    message: "Must contain at least 1 uppercase letter",
  })
  .regex(PASSWORD_RULES.lowercase, {
    message: "Must contain at least 1 lowercase letter",
  })
  .regex(PASSWORD_RULES.number, { message: "Must contain at least 1 number" })
  .regex(PASSWORD_RULES.special, {
    message: "Must contain at least 1 special character",
  })
  .regex(PASSWORD_RULES.noSpaces, {
    message: "Password cannot contain spaces",
  });

// ─────────────────────────────────────────────────────────────
// 📝 Registration form with password confirmation
// Most common pattern in sign-up screens
// ─────────────────────────────────────────────────────────────
export const RegisterPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─────────────────────────────────────────────────────────────
// 🔑 Change password form (authenticated flow)
// Validates old password + new password + confirmation
// ─────────────────────────────────────────────────────────────
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

export type RegisterPasswordInput = z.infer<typeof RegisterPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// ─────────────────────────────────────────────────────────────
// ✅ Usage examples
// ─────────────────────────────────────────────────────────────

// Registration
// const reg = RegisterPasswordSchema.parse({
//   password: "SecureP@ss1",
//   confirmPassword: "SecureP@ss1",
// }); // ✅

// Change password
// const change = ChangePasswordSchema.parse({
//   currentPassword: "OldP@ss1",
//   newPassword: "NewP@ss99!",
//   confirmPassword: "NewP@ss99!",
// }); // ✅
