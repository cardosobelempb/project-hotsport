import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { Prisma } from "../../../../../generated/prisma";
import { MikrotikEntity } from "../entities/mikrotik-entity";

export abstract class MikrotikRepository extends BaseSearchableRepository<MikrotikEntity> {
  abstract findById(id: string): Promise<MikrotikEntity | null>;
  abstract findByMacAddress(macAddress: string): Promise<MikrotikEntity | null>;
  abstract createWithTx(
    entity: MikrotikEntity,
    tx: Prisma.TransactionClient,
  ): Promise<MikrotikEntity>;
}
