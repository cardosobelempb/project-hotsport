import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de CampaignItem.
 * Itens de campanha (imagens, vídeos, etc).
 */
export abstract class CampaignItemRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract listByCampaign(campaignId: string): Promise<T[]>;

  // ====================== OUTROS ======================
  abstract reorderItems(
    campaignId: string,
    newOrder: { id: string; order: number }[],
  ): Promise<void>;
}
