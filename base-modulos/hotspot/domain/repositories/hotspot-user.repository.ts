import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de HotspotUser.
 * Gerencia usuários de hotspot (autenticação no MikroTik).
 */
export abstract class HotspotUserRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByUsername(
    organizationId: string,
    username: string,
  ): Promise<T | null>;
  abstract findByMacAddress(mac: string): Promise<T | null>;

  // ====================== OUTROS ======================
  abstract blockUser(id: string): Promise<T>;
  abstract syncWithMikrotik(id: string): Promise<void>;
}
