import { PageRepository } from "@/common/domain/repositories/page-repository";
import { UserEntity } from "../entities/user.entity";

/**
 * Repositório abstrato de User.
 * Gerencia operações de usuários do sistema (autenticação, perfil e soft delete).
 */
export abstract class UserRepository extends PageRepository<UserEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<UserEntity | null>;
  abstract findActiveByEmail(email: string): Promise<UserEntity | null>;
  abstract findActiveByIdWithProfile(id: string): Promise<UserEntity | null>;
  abstract findWithRelations(id: string): Promise<UserEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveById(id: string): Promise<boolean>;
  abstract existsActiveByEmail(email: string): Promise<boolean>;

  // ====================== CONTAGENS ======================
  abstract countActiveByTenant(tenantId: string): Promise<number>;

  // ====================== OUTROS ======================
  abstract changePassword(id: string, passwordHash: string): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract restore(id: string): Promise<void>;
}
