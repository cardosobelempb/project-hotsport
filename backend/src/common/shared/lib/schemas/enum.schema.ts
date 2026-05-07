// ─────────────────────────────────────────────────────────────
// 🏷️ Two enum approaches — each with its own purpose
// ─────────────────────────────────────────────────────────────

import z from "zod";

// Approach 1: z.enum() — simple and direct
// Use when values are fixed and need no runtime logic
export const OrderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
// → "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"

// ─────────────────────────────────────────────────────────────
// ✅ BEST PRACTICE: const object as the single source of truth
// Lets you use values at runtime (switch, guards, UI lists)
// ─────────────────────────────────────────────────────────────
export const UserRole = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;

// Zod reads values from the object — fully DRY!
export const UserRoleSchema = z.enum(UserRole);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Runtime usage — no magic strings repeated anywhere:
// if (user.role === UserRole.ADMIN) {
//   /* full access  */
// }
// if (user.role === UserRole.MODERATOR) {
//   /* limited access */
// }

// ─────────────────────────────────────────────────────────────
// 🔗 Syncing with Prisma enums — professional pattern
// Prisma exports its enums — reuse them directly in Zod!
// ─────────────────────────────────────────────────────────────
// import { Role, OrderStatus } from "@prisma/client"; // Prisma-generated enums
// import z from "zod";

// export const RolePrismaSchema = z.nativeEnum(Role);
// export const OrderStatusPrismaSchema = z.nativeEnum(OrderStatus);

// ─────────────────────────────────────────────────────────────
// 🛡️ Role-based access control schema
// ─────────────────────────────────────────────────────────────
// export const AdminRolesSchema = z.enum([UserRole.ADMIN, UserRole.MODERATOR]);

// export const AdminActionSchema = z.object({
//   action: z.string(),
//   requiredRole: AdminRolesSchema,
// });

// ─────────────────────────────────────────────────────────────
// ✅ Usage examples
// ─────────────────────────────────────────────────────────────

// Valid status
OrderStatusSchema.parse("SHIPPED"); // ✅
OrderStatusSchema.parse("LOST"); // ❌ → invalid enum value

// Valid role
UserRoleSchema.parse("ADMIN"); // ✅
UserRoleSchema.parse("SUPERUSER"); // ❌ → invalid enum value

// Getting all valid values (useful for UI dropdowns)
// const statuses = OrderStatusSchema.options;
// → ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
