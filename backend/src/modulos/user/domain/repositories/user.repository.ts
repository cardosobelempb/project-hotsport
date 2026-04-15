import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { Prisma } from "../../../../../generated/prisma";
import { UserEntity } from "../entities/user.entity";

export abstract class UserRepository extends BaseSearchableRepository<UserEntity> {
  abstract findByEmail(email: string): Promise<boolean | null>;
  abstract findByCpf(cpf: string): Promise<boolean | null>;
  abstract createWithTx(
    entity: UserEntity,
    tx: Prisma.TransactionClient,
  ): Promise<UserEntity>;
}
