import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Account as PrismaAccount } from "../../../../../generated/prisma";

import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { TokenType } from "@/common/shared/enums/token-type.enum";
import { AccountEntity } from "../../domain/entities/account.entity";

export class AccountMapper {
  static toDomain(raw: PrismaAccount): AccountEntity {
    return AccountEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        provider: raw.provider as ProviderType,
        providerAccountId: UUIDVO.create(raw.providerAccountId),
        refreshToken: raw.refreshToken || "",
        accessToken: raw.accessToken || "",
        expiresAt: raw.expiresAt || 0,
        tokenType: raw.tokenType as TokenType,
        scope: raw.scope || "",
        idToken: raw.idToken || "",
        sessionState: raw.sessionState || "",
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersist(entity: AccountEntity) {
    return {
      userId: entity.userId.getValue(),
      provider: entity.provider,
      providerAccountId: entity.providerAccountId.toString(),
    };
  }

  static toOutput(entity: AccountEntity) {
    return {
      id: entity.id.toString(),
      userId: entity.userId.getValue(),
      provider: entity.provider,
      providerAccountId: entity.providerAccountId.toString(),
    };
  }
}
