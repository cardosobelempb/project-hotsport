import { Prisma, PrismaClient } from "../../../../generated/prisma";

export type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export abstract class PrismaRepository {
  protected readonly prisma: PrismaClient | Prisma.TransactionClient;

  constructor(prisma: PrismaClient | PrismaTransaction) {
    this.prisma = prisma;
  }

  /**
   * Helper para executar código dentro de transação
   */
  static withTx<T extends PrismaRepository>(
    this: new (tx: PrismaTransaction) => T,
    tx: PrismaTransaction,
  ): T {
    return new this(tx);
  }
}
