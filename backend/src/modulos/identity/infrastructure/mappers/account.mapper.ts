import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Account as PrismaAccount } from "../../../../../generated/prisma";

import { AccountEntity } from "../../domain/entities/account.entity";
import { AccountProvider } from "@/common/shared/enums/provider-type.enum";

export class AccountMapper {
  static toDomain(raw: PrismaAccount): AccountEntity {
    return AccountEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        provider: raw.provider as AccountProvider,
        providerAccountId: UUIDVO.create(raw.providerAccountId),
    passwordHash
        createdAt: raw.createdAt,

      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersist(entity: AccountEntity) {
    return {
      userId: entity.userId.getValue(),
      provider: entity.provider,
      providerAccountId: entity.providerAccountId.toString(),
      passwordHash: entity.passwordHash,
    };
  }

  static toOutput(entity: AccountEntity) {
    return {
      id: entity.id.toString(),
      userId: entity.userId.getValue(),
      provider: entity.provider,
      providerAccountId: entity.providerAccountId.toString(),
      passwordHash: entity.passwordHash,
    };
  }
}
