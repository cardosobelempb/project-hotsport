import {
  Prisma,
  Token as PrismaToken,
} from "../../../../../../../generated/prisma";

import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { TokenEntity } from "@/modulos/account/domain/entities/token.entity";

export class TokenPrismaMapper {
  static toDomain(raw: PrismaToken): TokenEntity {
    return TokenEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        refreshToken: raw.refreshToken,
        accessToken: raw.accessToken,
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(entity: TokenEntity): Prisma.TokenUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt,
    };
  }

  static toUpdatePersistence(
    entity: TokenEntity,
  ): Prisma.TokenUncheckedUpdateInput {
    return {
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt,
    };
  }
}
