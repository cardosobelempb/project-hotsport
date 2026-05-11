import { PageRepository } from "@/common/domain/repositories/page-repository";
import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipEntity } from "../entities/member-ship.entity";

export abstract class MembershipRepository extends PageRepository<MembershipEntity> {
  abstract findByUserAndTenant(params: {
    userId: string;
    tenantId: string;
  }): Promise<MembershipEntity | null>;
  abstract findByUserTenantAndOrganization(params: {
    userId: string;
    tenantId: string;
    organizationId?: string;
  }): Promise<MembershipEntity | null>;
  abstract findActiveRolesByUserId(userId: string): Promise<MembershipEntity[]>;
  abstract hasRole(params: {
    userId: string;
    tenantId: string;
    roles: MembershipRole[];
  }): Promise<boolean>;
  abstract updateRole(params: {
    membershipId: string;
    role: MembershipRole;
  }): Promise<void>;
  abstract suspend(membershipId: string): Promise<void>;
  abstract remove(membershipId: string): Promise<void>;
}
