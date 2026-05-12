import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de Subscription.
 * Gerencia assinaturas ativas das organizações.
 */
export abstract class SubscriptionRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findActiveByOrganization(organizationId: string): Promise<T | null>;

  // ====================== OUTROS ======================
  abstract cancel(subscriptionId: string): Promise<T>;
  abstract renew(subscriptionId: string): Promise<T>;
}
