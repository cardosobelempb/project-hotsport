import { PageRepository } from "@/common/domain/repositories/page-repository";
/**
 * Repositório abstrato de Address.
 * Gerencia endereços de usuários, tenants e organizações.
 */

export abstract class AddressRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByUserId(userId: string): Promise<T[]>;
  abstract findByOrganizationId(organizationId: string): Promise<T[]>;
  abstract findByTenantId(tenantId: string): Promise<T[]>;
  abstract findPrimaryByUser(userId: string): Promise<T | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsPrimaryByUser(userId: string): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract setAsPrimary(addressId: string): Promise<T>;
  abstract findByCityAndState(cityId: string, stateId: string): Promise<T[]>;
}
