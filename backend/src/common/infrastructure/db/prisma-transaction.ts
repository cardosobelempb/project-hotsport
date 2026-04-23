import { PrismaClient } from "../../../../generated/prisma";

export type PrismaTransaction = Omit<PrismaClient, "$on" | "$use" | "$extends">;

export abstract class PrismaRepository {
  protected readonly prisma: PrismaClient | PrismaTransaction;

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
