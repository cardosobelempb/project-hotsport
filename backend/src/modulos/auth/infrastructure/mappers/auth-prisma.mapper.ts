import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Prisma, type Account } from "../../../../../generated/prisma";

import { AccountEntity } from "@/modulos/identity/domain/entities/account.entity";
import { AccountProvider } from "@/shared/enums/account-provider.enum";
import { AccountType } from "@/shared/enums/account-type.enum";

export class AccountPrismaMapper {
  static toDomain(raw: Account): AccountEntity {
    return AccountEntity.create({
      userId: UUIDVO.create(raw.userId),
      provider: raw.provider as AccountProvider,
      type: raw.type as AccountType,
      providerAccountId: UUIDVO.create(raw.providerAccountId),
      passwordHash: raw.passwordHash ?? "",
    });
  }

  static toPersist(entity: AccountEntity): Prisma.AccountUncheckedCreateInput {
    return {
      userId: entity.userId.toString(),
      provider: entity.provider as AccountProvider,
      type: entity.type as AccountType,
      providerAccountId: entity.provider.toString(),
      passwordHash: entity.passwordHash?.toString(),
    };
  }

  static toUpdatePrisma(
    entity: AccountEntity,
  ): Prisma.AccountUncheckedUpdateInput {
    return {
      passwordHash: entity.passwordHash?.toString(),
    };
  }

  // Domain entities → resposta HTTP
  static toHttp(
    account: AccountEntity,
  ): Omit<Prisma.AccountUncheckedCreateInput, "passwordHash"> {
    return {
      userId: account.userId.toString(),
      provider: account.provider as AccountProvider,
      type: account.type as AccountType,
      providerAccountId: account.providerAccountId.toString(),
    };
  }
}
