import { BaseSearchableRepository } from "@/common/domain/repositories/base-searchable.repository";
import { Prisma } from "../../../../../generated/prisma";
import { AccountEntity } from "../entities/account.entity";

export abstract class AccountRepository extends BaseSearchableRepository<AccountEntity> {
  abstract findByEmail(email: string): Promise<AccountEntity | null>;
  abstract createWithTx(
    entity: AccountEntity,
    tx: Prisma.TransactionClient,
  ): Promise<AccountEntity>;

  // abstract findByUserId(userId: string): Promise<AcountEntity | null>;
}
