import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de Portal.
 * Gerencia portais de captura/hotspot das organizações.
 */
export abstract class PortalRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByOrganization(organizationId: string): Promise<T | null>;
  abstract findActiveBySlug(slug: string): Promise<T | null>;

  // ====================== OUTROS ======================
  abstract activateCampaign(portalId: string, campaignId: string): Promise<T>;
}
