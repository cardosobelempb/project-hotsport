import { PageRepository } from "@/common/domain/repositories/page-repository";
import { TenantStatus } from "@/common/shared/enums/tenant-atatus.enum";
import { TenantEntity } from "../entities/tenant.entity";

/**
 * Repositório abstrato de Tenant.
 * Gerencia os tenants (empresas/saas) do sistema multi-tenant.
 */
export abstract class TenantRepository extends PageRepository<TenantEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<TenantEntity | null>;
  abstract findActiveBySlug(slug: string): Promise<TenantEntity | null>;
  abstract findActiveByDocument(document: string): Promise<TenantEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveBySlug(slug: string): Promise<boolean>;
  abstract existsActiveByDocument(document: string): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract changeStatus(
    id: string,
    status: TenantStatus,
  ): Promise<TenantEntity>;
}
