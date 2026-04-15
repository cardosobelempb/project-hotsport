import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { Prisma } from "../../../../../generated/prisma";
import { LgpdConsentEntity } from "../entities/lgpd-consent.entity";

export abstract class LgpdConsentRepository extends BaseSearchableRepository<LgpdConsentEntity> {
  abstract createWithTx(
    entity: LgpdConsentEntity,
    tx: Prisma.TransactionClient,
  ): Promise<LgpdConsentEntity>;
}
