import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { MemberEntity } from "../entities/member-entity";

export abstract class MemberRepository extends BaseSearchableRepository<MemberEntity> {
  abstract findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<MemberEntity | null>;

  abstract listByOrganization(organizationId: string): Promise<MemberEntity[]>;

  abstract exists(userId: string, organizationId: string): Promise<boolean>;
}
