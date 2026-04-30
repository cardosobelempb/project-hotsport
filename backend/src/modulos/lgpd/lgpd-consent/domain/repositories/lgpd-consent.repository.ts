import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { LgpdConsentEntity } from "../entities/lgpd-consent.entity";

export abstract class LgpdConsentRepository extends BaseSearchableRepository<LgpdConsentEntity> {
  abstract findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<LgpdConsentEntity | null>;

  abstract hasActiveConsent(
    userId: string,
    organizationId: string,
  ): Promise<boolean>;
}
