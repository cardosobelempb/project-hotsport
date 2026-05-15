import { PageRepository } from "@/common/domain/repositories/page-repository";
import { OrganizationStatus } from "@/common/shared/enums/organization-status-scope.enum";
import { OrganizationEntity } from "../../../tenant/domain/entities/organization.entity";

/**
 * Repositório abstrato de Organization.
 * Define o contrato para todas as operações relacionadas a Organizações no sistema SaaS.
 */
export abstract class OrganizationRepository extends PageRepository<OrganizationEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<OrganizationEntity | null>;
  abstract findActiveBySlug(slug: string): Promise<OrganizationEntity | null>;
  abstract findActiveByDocument(
    document: string,
  ): Promise<OrganizationEntity | null>;
  abstract findBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<OrganizationEntity | null>;
  abstract findWithConfigs(id: string): Promise<OrganizationEntity | null>;
  abstract findWithMikrotiks(id: string): Promise<OrganizationEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveById(id: string): Promise<boolean>;
  abstract existsActiveByDocument(document: string): Promise<boolean>;
  abstract existsActiveBySlug(slug: string): Promise<boolean>;
  abstract existsBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<boolean>;

  // ====================== CONTAGENS ======================
  abstract countActiveByTenant(tenantId: string): Promise<number>;
  abstract countByTenant(tenantId: string): Promise<number>;

  // ====================== OUTROS ======================
  abstract changeStatus(
    id: string,
    status: OrganizationStatus,
  ): Promise<OrganizationEntity>;
}
