import { BaseSearchableRepository } from "@/common/domain/repositories/base-searchable.repository";
import { MemberEntity } from "../entities/member-entity";

export abstract class MemberInviteRepository extends BaseSearchableRepository<MemberEntity> {
  abstract findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<MemberEntity | null>;

  abstract listByOrganization(organizationId: string): Promise<MemberEntity[]>;
}
