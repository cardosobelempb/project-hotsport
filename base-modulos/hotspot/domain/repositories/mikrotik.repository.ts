import { PageRepository } from "@/common/domain/repositories/page-repository";
import { MikrotikStatus } from "@/common/shared/enums/mikrotik-status.enum";
import { MikrotikEntity } from "@/modulos/hotspot/domain/entities/mikrotik-entity";

/**
 * Repositório abstrato de Mikrotik.
 * Gerencia dispositivos MikroTik vinculados às organizações.
 */
export abstract class MikrotikRepository extends PageRepository<MikrotikEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<MikrotikEntity | null>;
  abstract findByOrganization(
    organizationId: string,
  ): Promise<MikrotikEntity[]>;

  // ====================== OUTROS ======================
  abstract updateStatus(
    id: string,
    status: MikrotikStatus,
  ): Promise<MikrotikEntity>;
  abstract updateCredentials(
    id: string,
    username: string,
    passwordHash: string,
  ): Promise<MikrotikEntity>;
}
