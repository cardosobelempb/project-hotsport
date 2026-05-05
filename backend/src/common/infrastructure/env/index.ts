import { parseEnvArray } from "@/common/shared/schemas/helpers";
import "dotenv/config";
import { z } from "zod";
import { EnvValidationError } from "./env-validation.error";

export const envSchema = z.object({
  // App configuration
  TITLE: z.string().default("Hotspot API"),
  DESCRIPTION: z.string().default("API para gerenciamento de hotspots Wi-Fi"),
  VERSION: z.string().default("1.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4949),
  HOST: z.string().default("127.0.0.1"),
  PUBLIC_HOST: z.string().default("localhost"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  ORGANIZATION_NAME: z.string().default("Hotspot Inc."),
  ORIGIN: z.string().transform(parseEnvArray),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  // POSTGRES_USER: z
  //   .string()
  //   .min(1, "POSTGRES_USER é obrigatório")
  //   .default("postgres"),
  // POSTGRES_PASSWORD: z
  //   .string()
  //   .min(1, "POSTGRES_PASSWORD é obrigatório")
  //   .default("docker"),
  // POSTGRES_DB: z
  //   .string()
  //   .min(1, "POSTGRES_DB é obrigatório")
  //   .default("hotspot"),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET é obrigatória"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET é obrigatória"),
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET é obrigatória"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET é obrigatória"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  // Cookie
  COOKIE_SECRET: z.string().min(1, "COOKIE_SECRET é obrigatória"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const error = new EnvValidationError("process.env");

  parsed.error.issues.forEach((issue) => {
    error.addFieldError(issue.path.join(".") || "env", issue.message);
  });

  console.error(error.toJSON());
  process.exit(1); // ✅ fail fast — nunca sobe com env inválido
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
