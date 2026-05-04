import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Account as PrismaAccount } from "../../../../../generated/prisma";

import { AccountEntity } from "../../domain/entities/account.entity";

export class AccountMapper {
  static toDomain(raw: PrismaAccount): AccountEntity {
    return AccountEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        providerAccountId: UUIDVO.create(raw.providerAccountId),
        provider: raw.provider as AccountProviderDto,
        passwordHash: raw.passwordHash,
        type: raw.type as AccountTypeDto,
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
