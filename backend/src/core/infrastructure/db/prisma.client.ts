import { PrismaClient } from "@/generated/prisma/index.js";

import { Logger } from "../observability/logger";

declare global {
  var __prisma: PrismaClient | undefined;
}

type PrismaFactoryOptions = {
  logger?: Logger;
};

function buildPrismaClient(options: PrismaFactoryOptions = {}): PrismaClient {
  const prisma = new PrismaClient({
    log: [
      { level: "warn", emit: "event" },
      { level: "error", emit: "event" },
      // Em produção você pode remover query/info para não vazar dados
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
 * Singleton: reutiliza no dev para evitar "too many connections"
 */
export function getPrismaClient(
  options: PrismaFactoryOptions = {},
): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__prisma) globalThis.__prisma = buildPrismaClient(options);
    return globalThis.__prisma;
  }
  return buildPrismaClient(options);
}
