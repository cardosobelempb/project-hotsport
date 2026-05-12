import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de ConnectionLog.
 * Logs de conexões de hotspot (MikroTik).
 */

export abstract class ConnectionLogRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract listByOrganization(
    organizationId: string,
    filters: { startDate?: Date; endDate?: Date; username?: string },
  ): Promise<T[]>;

  // ====================== OUTROS ======================
  abstract logConnection(data: T): Promise<T>;
}
