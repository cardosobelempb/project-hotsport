import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import {
  Prisma,
  type Account as PrismaAccount,
} from "../../../../../generated/prisma";

import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { TokenType } from "@/common/shared/enums/token-type.enum";
import { AccountEntity } from "@/modulos/identity/domain/entities/account.entity";

export class AccountPrismaMapper {
  static toDomain(raw: PrismaAccount): AccountEntity {
    return AccountEntity.create({
      userId: UUIDVO.create(raw.userId),
      provider: raw.provider,
      providerAccountId: UUIDVO.create(raw.providerAccountId),
      providerType: raw.providerType as ProviderType,
      refreshToken: raw.refreshToken,
      accessToken: raw.accessToken,
      expiresAt: raw.expiresAt,
      tokenType: raw.tokenType as TokenType,
      scope: raw.scope,
      idToken: raw.idToken,
      sessionState: raw.sessionState,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toPersist(entity: AccountEntity): Prisma.AccountUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      provider: entity.provider,
      providerAccountId: entity.providerAccountId.toString(),
      providerType: entity.providerType as ProviderType,
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt,
      tokenType: entity.tokenType as TokenType,
      scope: entity.scope,
      idToken: entity.idToken,
      sessionState: entity.sessionState,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? null,
      deletedAt: entity.deletedAt ?? null,
    };
  }

  static toUpdatePrisma(
    entity: AccountEntity,
  ): Prisma.AccountUncheckedUpdateInput {
    return {
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt,
      tokenType: entity.tokenType as TokenType,
      scope: entity.scope,
      idToken: entity.idToken,
      sessionState: entity.sessionState,
      updatedAt: new Date(),
    };
  }

  // Domain entities → resposta HTTP
  static toHttp(
    account: AccountEntity,
  ): Omit<Prisma.AccountUncheckedCreateInput, "passwordHash"> {
    return {
      id: account.id.toString(),
      userId: account.userId.toString(),
      provider: account.provider,
      providerAccountId: account.providerAccountId.toString(),
      providerType: account.providerType as ProviderType,
      refreshToken: account.refreshToken,
      accessToken: account.accessToken,
      expiresAt: account.expiresAt,
      tokenType: account.tokenType as TokenType,
      scope: account.scope,
      idToken: account.idToken,
      sessionState: account.sessionState,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt ?? null,
      deletedAt: account.deletedAt ?? null,
    };
  }
}
