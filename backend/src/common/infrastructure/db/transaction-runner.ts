import { PrismaUserRepository } from "@/modulos/identity/infrastructure/http/repositories/prisma/prisma-user.repository";
import type { PrismaClient } from "../../../../generated/prisma";

export class TransactionRunner {
  constructor(private readonly prisma: PrismaClient) {}

  async run<T>(
    callback: (tx: { users: PrismaUserRepository }) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (transaction) => {
      return callback({
        users: PrismaUserRepository.withTx(transaction),
      });
    });
  }
}
