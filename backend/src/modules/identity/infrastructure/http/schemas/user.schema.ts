// ============================================================
// User.schema.ts
// Schemas exclusivos da entidade User.
// ============================================================

import { z } from "zod";

import { s } from "@/common/shared/lib/schemas/primitives";
import {
  createResponseSchema,
  findResponseSchema,
  pageResponseSchema,
  updateResponseSchema,
} from "@/common/shared/lib/schemas/response.factory";
import {
  EmailSchema,
  UuidSchema,
} from "@/common/shared/lib/schemas/string.schema";

// ─── Params ───────────────────────────────────────────────────────────────────

export const UserParamsSchema = z.object({
  UserId: UuidSchema,
});

export type UserParams = z.infer<typeof UserParamsSchema>;

// ─── Schema base da entidade ──────────────────────────────────────────────────

export const UserSchema = z
  .object({
    id: UuidSchema,
    email: EmailSchema,
    emailVerified: s.nullableDate,
    passwordHash: s.string.min(60), // bcrypt $2b$...
    createdAt: s.date,
    updatedAt: s.nullableDate,
    deletedAt: s.nullableDate,
  })
  .strict();

// ─── Body schemas (entrada) ───────────────────────────────────────────────────

export const CreateUserSchema = UserSchema.omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

// ─── Response schemas (saída) ─────────────────────────────────────────────────

export const UserResponseSchema = UserSchema.omit({
  passwordHash: true,
  deletedAt: true,
  updatedAt: true,
});

export const UserSummarySchema = UserResponseSchema.pick({
  id: true,
  email: true,
  emailVerified: true,
});

// ─── Response wrappers ────────────────────────────────────────────────────────

export const UserCreateResponseSchema =
  createResponseSchema(UserResponseSchema);
export const UserFindByIdResponseSchema =
  findResponseSchema(UserResponseSchema);
export const UserUpdateResponseSchema =
  updateResponseSchema(UserResponseSchema);
export const UserPageResponseSchema = pageResponseSchema(UserSummarySchema);
