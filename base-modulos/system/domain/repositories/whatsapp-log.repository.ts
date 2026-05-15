import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de WhatsappLog.
 * Logs de envios de mensagens WhatsApp.
 */
export abstract class WhatsappRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract listByOrganization(
    organizationId: string,
    filters?: any,
  ): Promise<T[]>;

  // ====================== OUTROS ======================
  abstract logMessage(data: T): Promise<T>;
}
