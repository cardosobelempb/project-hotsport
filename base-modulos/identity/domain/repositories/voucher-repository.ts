import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de Voucher.
 * Gerencia vouchers/códigos de acesso para hotspot.
 */
export abstract class VoucherRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByCode(code: string): Promise<T | null>;
  abstract listAvailableByOrganization(organizationId: string): Promise<T[]>;

  // ====================== OUTROS ======================
  abstract createBatch(data: T): Promise<T[]>;
  abstract useVoucher(code: string, hotspotUserId?: string): Promise<T>;
}
