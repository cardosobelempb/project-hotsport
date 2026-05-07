// ─────────────────────────────────────────────────────────────
// 🔀 z.discriminatedUnion — polymorphic types / type narrowing
// More performant than z.union — uses the discriminator key

import z from "zod";
import { PriceSchema } from "./number.schema";
import { EmailSchema, PhoneSchema, UuidSchema } from "./string.schema";

// ─────────────────────────────────────────────────────────────
export const NotificationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("EMAIL"),
    recipient: EmailSchema,
    subject: z.string().min(1).max(200),
    body: z.string().max(5000),
  }),
  z.object({
    type: z.literal("SMS"),
    phone: PhoneSchema,
    text: z.string().max(160), // SMS character limit
  }),
  z.object({
    type: z.literal("PUSH"),
    deviceToken: z.string().min(1),
    title: z.string().max(65), // iOS push title limit
    body: z.string().max(240),
  }),
]);

export type Notification = z.infer<typeof NotificationSchema>;

// ─────────────────────────────────────────────────────────────
// 🔁 z.array() — typed lists with content validation
// ─────────────────────────────────────────────────────────────
export const TagsSchema = z
  .array(z.string().min(1).max(30).toLowerCase().trim())
  .min(1, { message: "At least 1 tag is required" })
  .max(10, { message: "Maximum 10 tags allowed" });

// Bulk IDs (e.g. delete multiple records in one request)
export const BulkIdsSchema = z.object({
  ids: z
    .array(UuidSchema)
    .min(1, { message: "Provide at least 1 ID" })
    .max(100, { message: "Maximum 100 IDs per request" }),
});

// ─────────────────────────────────────────────────────────────
// 🌐 z.record() — dynamic key objects (dictionaries)
// Great for metadata, settings, translations
// ─────────────────────────────────────────────────────────────
export const MetadataSchema = z.record(
  z.string(), // key: any string
  z.unknown(), // value: anything
);

// Typed translations with fixed language keys
export const TranslationSchema = z.record(
  z.enum(["en", "pt", "es", "fr"]),
  z.string(),
);

// ─────────────────────────────────────────────────────────────
// 🧮 z.preprocess — transform BEFORE validation
// Ideal for normalizing data from external sources or forms
// ─────────────────────────────────────────────────────────────
export const MonetaryValueSchema = z.preprocess((value) => {
  // Accepts "1,299.90" and "1.299,90" (Brazilian format)
  if (typeof value === "string") {
    const normalized = value
      .replace(/\./g, "") // remove thousand separators
      .replace(",", "."); // normalize decimal separator
    return parseFloat(normalized);
  }
  return value;
}, PriceSchema);

MonetaryValueSchema.parse("1.299,90"); // → 1299.90 ✅
MonetaryValueSchema.parse("199.99"); // → 199.99  ✅

// ─────────────────────────────────────────────────────────────
// 🛡️ safeParse wrapper — never throws, returns typed result
// Use in controllers and gateways to handle errors gracefully
// ─────────────────────────────────────────────────────────────
export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Formats errors into a field-keyed object — frontend-friendly
    const errors = result.error.flatten().fieldErrors;
    return { success: false, errors } as const;
  }

  return { success: true, data: result.data } as const;
}

// Usage in an Express / Fastify controller:
// const result = validate(ProductSchema, req.body);

// if (!result.success) {
//   return res.status(400).json({ errors: result.errors });
// }

// result.data is fully typed and safe here ✅
// const { name, price, stock } = result.data;

// ─────────────────────────────────────────────────────────────
// ✅ Usage examples
// ─────────────────────────────────────────────────────────────

// Discriminated union
NotificationSchema.parse({
  type: "EMAIL",
  recipient: "john@email.com",
  subject: "Welcome!",
  body: "Thanks for signing up.",
}); // ✅

NotificationSchema.parse({
  type: "SMS",
  phone: "5511912345678",
  text: "Your code is 1234",
}); // ✅

// Bulk delete
BulkIdsSchema.parse({
  ids: [
    "123e4567-e89b-12d3-a456-426614174000",
    "987fbc97-4bed-5078-af07-9141ba07c9f3",
  ],
}); // ✅

// Translation record
TranslationSchema.parse({
  en: "Hello",
  pt: "Olá",
  es: "Hola",
}); // ✅
