import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { Prisma, type Account } from "../../../../../generated/prisma";

import { AccountEntity } from "@/modulos/account/domain/entities/account.entity";

export class AccountPrismaMapper {
  static toDomain(raw: Account): AccountEntity {
    return AccountEntity.create({
      userId: UUIDVO.create(raw.userId),
      provider: raw.provider,
      providerAccountId: UUIDVO.create(raw.providerAccountId),
      passwordHash: raw.passwordHash ?? "",
    });
  }

  static toPersist(entity: AccountEntity): Prisma.AccountUncheckedCreateInput {
    return {
      userId: entity.userId.toString(),
      provider: "credentials",
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
      provider: account.provider,
      providerAccountId: account.providerAccountId.toString(),
    };
  }
}
