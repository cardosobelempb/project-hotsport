import { Account as PrismaAccount } from "../../../../../generated/prisma";

import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { AccountEntity } from "../../domain/entities/account.entity";

export class AccountMapper {
  static toDomain(raw: PrismaAccount): AccountEntity {
    return AccountEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        provider: raw.provider,
        providerAccountId: UUIDVO.create(raw.providerAccountId),
        passwordHash: raw.passwordHash ?? "",
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersist(entity: AccountEntity) {
    return {
      id: entity.id.toString(),
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
