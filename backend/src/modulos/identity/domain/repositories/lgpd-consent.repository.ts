import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de LgpdConsent.
 * Gerencia consentimentos LGPD dos usuários.
 */
export abstract class LgpdConsentRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findActiveByUser(userId: string): Promise<T | null>;

  // ====================== OUTROS ======================
  abstract withdrawConsent(userId: string): Promise<T>;
  abstract updateConsents(userId: string, consents: any): Promise<T>;
}
