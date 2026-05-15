import z from "zod";

export const DecimalSchema = z.string().refine(
  (value) => {
    return !isNaN(Number(value));
  },
  {
    message: "Invalid decimal number",
  },
);
