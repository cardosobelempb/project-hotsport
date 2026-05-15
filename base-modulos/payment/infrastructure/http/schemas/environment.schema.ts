import z from "zod";

export const EnvironmentSchema = z.enum(["SANDBOX", "PRODUCTION"]);
