import z from "zod";

export const MacAddressSchema = z
  .string()
  .regex(
    /^([0-9A-Fa-f]{2}[:\-]){5}([0-9A-Fa-f]{2})$/,
    "Invalid MAC address format",
  );
