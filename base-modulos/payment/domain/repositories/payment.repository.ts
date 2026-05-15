import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de Payment.
 * Gerencia transações de pagamento.
 */
export abstract class PaymentRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByProviderTransactionId(providerId: string): Promise<T | null>;
  abstract listByOrganization(
    organizationId: string,
    filters?: any,
  ): Promise<T[]>;

  // ====================== OUTROS ======================
  abstract updateStatus(paymentId: string, status: T): Promise<T>;
}
