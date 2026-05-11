import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Account as Prismaccount } from "../../../../../generated/prisma";

import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { TokenType } from "@/common/shared/enums/token-type.enum";
import { AccountEntity } from "../entities/account.entity";

export class AccountMapper {
  static toDomain(raw: Prismaccount): AccountEntity {
    return AccountEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        provider: raw.provider as ProviderType,
        providerAccountId: UUIDVO.create(raw.providerAccountId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersist(entity: AccountEntity) {
    return {
      id: entity.id.toString(),
      userId: entity.userId.getValue(),
      provider: entity.provider as ProviderType,
      providerAccountId: entity.providerAccountId.getValue(),
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt,
      tokenType: entity.tokenType as TokenType,
      scope: entity.scope,
      idToken: entity.idToken,
      sessionState: entity.sessionState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
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
