import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../../../../generated/prisma";

export type PrismaTransaction = Omit<PrismaClient, "$on" | "$use" | "$extends">;

import { Logger } from "../observability/logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | PrismaTransaction | undefined;
}

type PrismaFactoryOptions = {
  logger?: Logger;
};

function buildPrismaClient(options: PrismaFactoryOptions = {}): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida.");
  }

  // ✅ ADAPTER (obrigatório no Prisma 7 com engine "client")
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

  prisma.$on("warn", (e) => logger?.warn({ prisma: e }, "Prisma warn"));
  prisma.$on("error", (e) => logger?.error({ prisma: e }, "Prisma error"));
  prisma.$on("info", (e) => logger?.info({ prisma: e }, "Prisma info"));

  return prisma;
}

/**
 * Singleton: evita múltiplas conexões em dev
 */
export function getPrismaClient(
  options: PrismaFactoryOptions = {},
): PrismaClient | PrismaTransaction {
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__prisma) {
      globalThis.__prisma = buildPrismaClient(options);
    }
    return globalThis.__prisma;
  }

  return buildPrismaClient(options);
}
