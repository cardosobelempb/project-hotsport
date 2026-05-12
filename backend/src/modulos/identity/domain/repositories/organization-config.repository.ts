import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de OrganizationConfig.
 * Configurações JSON flexíveis por tipo (MercadoPago, WhatsApp, Hotspot, etc).
 */
export abstract class OrganizationConfigRepository<
  T,
> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByOrganizationAndType(
    organizationId: string,
    configType: T,
  ): Promise<T | null>;

  abstract findAllByOrganization(organizationId: string): Promise<T[]>;

  // ====================== EXISTÊNCIA ======================
  abstract existsByOrganizationAndType(
    organizationId: string,
    configType: T,
  ): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract upsertConfig(
    organizationId: string,
    configType: T,
    configJson: any,
  ): Promise<T>;
}
