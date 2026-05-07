import { PageRepository } from "@/common/domain/repositories/page-repository";
import { MikrotikEntity } from "../entities/mikrotik-entity";

export abstract class MikrotikRepository extends PageRepository<MikrotikEntity> {
  abstract listByOrganization(
    organizationId: string,
  ): Promise<MikrotikEntity[]>;

  abstract findByMacAddress(macAddress: string): Promise<MikrotikEntity | null>;

  abstract findOnline(organizationId: string): Promise<MikrotikEntity[]>;
}
