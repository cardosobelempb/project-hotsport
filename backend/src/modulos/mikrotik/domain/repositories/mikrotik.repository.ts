import { BaseSearchableRepository } from "@/common/domain/repositories/base-searchable.repository";
import { MikrotikEntity } from "../entities/mikrotik-entity";

export abstract class MikrotikRepository extends BaseSearchableRepository<MikrotikEntity> {
  abstract listByOrganization(
    organizationId: string,
  ): Promise<MikrotikEntity[]>;

  abstract findByMacAddress(macAddress: string): Promise<MikrotikEntity | null>;

  abstract findOnline(organizationId: string): Promise<MikrotikEntity[]>;
}
