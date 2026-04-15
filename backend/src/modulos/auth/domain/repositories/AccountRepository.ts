import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { AccountEntity } from "@/modulos/account/domain/entities/account.entity";
import { Prisma } from "../../../../../generated/prisma";

export abstract class AccountRepository extends BaseSearchableRepository<AccountEntity> {
  abstract findByEmail(email: string): Promise<AccountEntity | null>;
  abstract createWithTx(
    entity: AccountEntity,
    tx: Prisma.TransactionClient,
  ): Promise<AccountEntity>;

  // abstract findByUserId(userId: string): Promise<AcountEntity | null>;
}

/** @deprecated Use AccountRepository directly */
export type AuthRepository = AccountRepository;
