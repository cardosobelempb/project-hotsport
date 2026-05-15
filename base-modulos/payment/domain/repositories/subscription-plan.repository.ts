import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de SubscriptionPlan.
 * Gerencia planos de assinatura SaaS.
 */
export abstract class SubscriptionPlanRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract listPublicPlans(): Promise<T[]>;
  abstract findActiveByCode(code: string): Promise<T | null>;
}
