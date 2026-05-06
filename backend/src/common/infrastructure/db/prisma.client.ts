// shared/database/prisma.ts

import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { Prisma, PrismaClient } from "../../../../generated/prisma";
import { Logger } from "../observability/logger";

export type PrismaTransaction = Prisma.TransactionClient;

export type PrismaDatabase = PrismaClient | PrismaTransaction;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

type PrismaFactoryOptions = {
  logger?: Logger;
};

function buildPrismaClient(options: PrismaFactoryOptions = {}): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL nao esta definida");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
    log: [
      { level: "warn", emit: "event" },
      { level: "error", emit: "event" },
      { level: "info", emit: "event" },
    ],
  });

  const logger = options.logger;

  prisma.$on("warn", (event) =>
    logger?.warn(
      { event: "PRISMA_WARN", context: "database", prisma: event },
      "Prisma warning",
    ),
  );

  prisma.$on("error", (event) =>
    logger?.error(
      { event: "PRISMA_ERROR", context: "database", prisma: event },
      "Prisma error",
    ),
  );

  prisma.$on("info", (event) =>
    logger?.info(
      { event: "PRISMA_INFO", context: "database", prisma: event },
      "Prisma info",
    ),
  );

  return prisma;
}

/**
 * Singleton do Prisma raiz.
 *
 * Importante:
 * - Apenas PrismaClient raiz deve ficar no global.
 * - TransactionClient nunca deve ficar no global.
 */
export function getPrismaClient(
  options: PrismaFactoryOptions = {},
): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__prisma) {
      globalThis.__prisma = buildPrismaClient(options);
    }

    return globalThis.__prisma;
  }

  return buildPrismaClient(options);
}
