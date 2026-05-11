import { PageRepository } from "@/common/domain/repositories/page-repository";
import { OrganizationEntity } from "../entities/organization.entity";

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

  // ====================== EXISTÊNCIA ======================

  abstract existsActiveById(id: string): Promise<boolean>;

  abstract existsActiveByDocument(document: string): Promise<boolean>;

  abstract existsActiveBySlug(slug: string): Promise<boolean>;

  abstract existsBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<boolean>;

  // ====================== CONTAGENS ======================

  /**
   * Conta todas as organizations ativas vinculadas a uma Account.
   * Usado para validar limites de plano no SaaS.
   */
  abstract countActiveByAccountId(accountId: string): Promise<number>;

  /**
   * Conta organizations (sem filtro de status) - uso mais raro.
   */
  abstract countByAccountId(accountId: string): Promise<number>;

  // ====================== OUTROS ======================

  // Caso precise de listagem paginada (herdado do PageRepository)
  // abstract findManyPaginated(...): Promise<PaginatedResult<OrganizationEntity>>;
}
