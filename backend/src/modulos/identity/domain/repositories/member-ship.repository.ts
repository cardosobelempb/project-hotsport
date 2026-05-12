import { PageRepository } from "@/common/domain/repositories/page-repository";
import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipEntity } from "../entities/member-ship.entity";

/**
 * Repositório abstrato de Membership.
 * Gerencia associações entre usuários, tenants e organizações (papéis e permissões).
 */
export abstract class MembershipRepository extends PageRepository<MembershipEntity> {
  // ====================== BUSCAS ======================
  abstract findByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<MembershipEntity | null>;
  abstract findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<MembershipEntity | null>;
  abstract listByOrganization(
    organizationId: string,
    filters?: any,
  ): Promise<MembershipEntity[]>;

  // ====================== OUTROS ======================
  abstract changeRole(
    memberId: string,
    role: MembershipRole,
  ): Promise<MembershipEntity>;
  abstract removeMember(memberId: string): Promise<void>;
  abstract acceptInvitation(memberId: string): Promise<MembershipEntity>;
}
