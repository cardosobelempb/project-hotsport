import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";
import { Prisma } from "../../../../../generated/prisma";
import { OrganizationEntity } from "../entities/organization.entity";

export abstract class OrganizationRepository extends BaseSearchableRepository<OrganizationEntity> {
  abstract findByEmail(email: string): Promise<boolean | null>;
  abstract findByCpf(cpf: string): Promise<boolean | null>;
  abstract createWithTx(
    entity: OrganizationEntity,
    tx: Prisma.TransactionClient,
  ): Promise<OrganizationEntity>;
}
