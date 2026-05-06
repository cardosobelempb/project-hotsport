// shared/database/prisma-repository.ts

import type { PrismaClient } from "../../../../generated/prisma";

export type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export type PrismaDatabase = PrismaClient | PrismaTransaction;

export abstract class PrismaRepository {
  protected readonly prisma: PrismaDatabase;

  constructor(prisma: PrismaDatabase) {
    this.prisma = prisma;
  }

  static withTx<T extends PrismaRepository>(
    this: new (tx: PrismaDatabase) => T,
    tx: PrismaTransaction,
  ): T {
    return new this(tx);
  }
}
