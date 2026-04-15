import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../../generated/prisma";
import { Logger } from "../observability/logger";

declare global {
  var __prisma: PrismaClient | undefined;
}

type PrismaFactoryOptions = {
  logger?: Logger;
};

function buildPrismaClient(options: PrismaFactoryOptions = {}): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"] ?? "",
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

export function getPrismaClient(
  options: PrismaFactoryOptions = {},
): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__prisma) globalThis.__prisma = buildPrismaClient(options);
    return globalThis.__prisma;
  }
  return buildPrismaClient(options);
}
