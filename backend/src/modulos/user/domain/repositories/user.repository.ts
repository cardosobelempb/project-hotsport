import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { Prisma } from "../../../../../generated/prisma";
import { UserEntity } from "../entities/user.entity";

export abstract class UserRepository extends BaseSearchableRepository<UserEntity> {
  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract findByCpf(cpf: string): Promise<UserEntity | null>;

  abstract existsByEmail(email: string): Promise<boolean>;

  abstract existsByCpf(cpf: string): Promise<boolean>;

  abstract createWithTx(
    entity: UserEntity,
    tx: Prisma.TransactionClient,
  ): Promise<UserEntity>;
}
