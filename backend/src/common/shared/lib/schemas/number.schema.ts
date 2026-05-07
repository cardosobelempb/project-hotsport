// ─────────────────────────────────────────────────────────────
// 🔢 Numbers with clear business semantics
// ─────────────────────────────────────────────────────────────

import z from "zod";
import { NameSchema } from "./string.schema";

// Monetary — 2 decimal places, no negatives
export const PriceSchema = z
  .number()
  .positive({ message: "Price must be positive" })
  .multipleOf(0.01, { message: "Maximum 2 decimal places" })
  .max(999_999.99, { message: "Price is too high" });

// Percentage
export const PercentageSchema = z
  .number()
  .min(0, { message: "Minimum is 0%" })
  .max(100, { message: "Maximum is 100%" });

// Stock quantity
export const QuantitySchema = z
  .number()
  .int({ message: "Must be a whole number" })
  .nonnegative({ message: "Cannot be negative" });

// Star rating (1 to 5)
export const RatingSchema = z
  .number()
  .int()
  .min(1, { message: "Minimum rating is 1" })
  .max(5, { message: "Maximum rating is 5" });

// ─────────────────────────────────────────────────────────────
// ⚡ coerce.number — converts strings to numbers
// Essential for query params, which always arrive as strings
// Example: GET /products?page=2&limit=10
// ─────────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Usage with query params (Express / Fastify / Hono):
PaginationSchema.parse({ page: "2", limit: "50" });
// → { page: 2, limit: 50 } ✅

// ─────────────────────────────────────────────────────────────
// 🛒 Product schema with prices — real-world example
// Cross-field validation: promotional price < original price
// ─────────────────────────────────────────────────────────────
export const ProductSchema = z
  .object({
    name: NameSchema,
    price: PriceSchema,
    salePrice: PriceSchema.nullable().optional(),
    stock: QuantitySchema,
    discountRate: PercentageSchema.default(0),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.price, {
    message: "Sale price must be lower than the original price",
    path: ["salePrice"],
  });

export type ProductInput = z.infer<typeof ProductSchema>;

// ─────────────────────────────────────────────────────────────
// ✅ Usage examples
// ─────────────────────────────────────────────────────────────

// Valid product
const product = ProductSchema.parse({
  name: "Wireless Headphones",
  price: 199.99,
  salePrice: 149.99,
  stock: 50,
  discountRate: 25,
}); // ✅

// Invalid — sale price higher than original
ProductSchema.safeParse({
  name: "Keyboard",
  price: 99.99,
  salePrice: 149.99, // ❌ → "Sale price must be lower than the original price"
  stock: 10,
});

// Query params coercion
PaginationSchema.parse({ page: "3", limit: "25" });
// → { page: 3, limit: 25 } ✅
