import { BaseSearchableRepository } from "@/common/domain/repositories/base-searchable.repository";
import { HotsportUserEntity } from "../entities/hotsport-user-entity";

export abstract class HotspotUserRepository extends BaseSearchableRepository<HotsportUserEntity> {
  abstract findByUsernameAndOrganization(
    username: string,
    organizationId: string,
  ): Promise<HotsportUserEntity | null>;

  abstract listByMikrotik(mikrotikId: string): Promise<HotsportUserEntity[]>;
}
