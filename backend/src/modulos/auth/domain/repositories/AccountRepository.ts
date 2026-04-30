import { BaseRepository } from "@/common/domain/repositories/base.repository";
import { AccountEntity } from "@/modulos/identity/domain/entities/account.entity";
import { Prisma } from "../../../../../generated/prisma";

export abstract class AccountRepository extends BaseRepository<AccountEntity> {
  abstract findByEmail(email: string): Promise<AccountEntity | null>;
  abstract createWithTx(
    entity: AccountEntity,
    tx: Prisma.TransactionClient,
  ): Promise<AccountEntity>;

  // abstract findByUserId(userId: string): Promise<AcountEntity | null>;
}

/** @deprecated Use AccountRepository directly */
export type AuthRepository = AccountRepository;
