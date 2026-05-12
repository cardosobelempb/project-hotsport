import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de MercadoPagoConfig.
 * Configurações específicas do Mercado Pago.
 */
export abstract class MercadoPagoConfigRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByOrganization(organizationId: string): Promise<T | null>;

  // ====================== OUTROS ======================
  abstract updateEncryptedToken(
    organizationId: string,
    accessTokenEncrypted: string,
  ): Promise<T>;
}
