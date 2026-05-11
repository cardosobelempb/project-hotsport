import { PageRepository } from "@/common/domain/repositories/page-repository";
import { TenantEntity } from "../entities/tenant.entity";

export abstract class TenantRepository extends PageRepository<TenantEntity> {
  abstract findByEmail(email: string): Promise<TenantEntity | null>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract updatePasswordHash(
    TenantId: string,
    passwordHash: string,
  ): Promise<void>;
  abstract markEmailAsVerified(TenantId: string): Promise<void>;
  abstract softDelete(TenantId: string): Promise<void>;
}
