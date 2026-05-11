// src/common/domain/transaction/transaction-manager.ts

import { PrismaDatabase } from "../prisma-repository";

/**
 * Abstração de unidade de trabalho transacional.
 *
 * O domínio conhece apenas este contrato — nunca o Prisma diretamente.
 * Isso garante que a camada de domínio/aplicação seja totalmente
 * independente da infraestrutura de banco de dados.
 *
 * Padrão: Unit of Work  (Martin Fowler — Patterns of Enterprise Application Architecture)
 */

export abstract class TransactionManager {
  /**
   * Executa um conjunto de operações dentro de uma transação atômica.
   * Em caso de erro, todas as operações são revertidas (rollback automático).
   *
   * @param work - Função que recebe o contexto transacional e executa as operações
   *
   * @example
   * await this.transactionManager.run(async (tx) => {
   *   await orderRepo.withTx(tx).create(order);
   *   await stockRepo.withTx(tx).decrement(order.itemId);
   * });
   */
  abstract run<T>(work: (tx: PrismaDatabase) => Promise<T>): Promise<T>;
}
