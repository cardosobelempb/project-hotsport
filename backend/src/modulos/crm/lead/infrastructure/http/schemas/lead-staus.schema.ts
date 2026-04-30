import z from "zod";

export const LeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "CONVERTED",
  "DISCARDED",
]);
