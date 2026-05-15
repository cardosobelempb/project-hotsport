import { PageRepository } from "@/common/domain/repositories/page-repository";
import { LgpdConsentsEntity } from "../entities/lgpd-consents.entity";

/**
 * Repositório abstrato de LgpdConsent.
 * Gerencia consentimentos LGPD dos usuários.
 */
export abstract class LgpdConsentsRepository extends PageRepository<LgpdConsentsEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveByUserId(
    userId: string,
  ): Promise<LgpdConsentsEntity | null>;
  abstract existsByUserIdAndVersion(
    userId: string,
    consentVersion: string,
  ): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract withdrawConsent(userId: string): Promise<LgpdConsentsEntity>;
  abstract updateConsents(
    userId: string,
    consents: any,
  ): Promise<LgpdConsentsEntity>;
  abstract findByUserIdAndVersion(
    userId: string,
    consentVersion: string,
  ): Promise<LgpdConsentsEntity | null>;
  abstract revoke(id: string): Promise<void>;
  abstract withdraw(id: string): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
}
