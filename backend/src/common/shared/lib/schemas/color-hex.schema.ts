import z from "zod";

export const ColorHexSchema = z.object({
  type: z.literal("color-hex"),
  value: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid color hex format"),
});
