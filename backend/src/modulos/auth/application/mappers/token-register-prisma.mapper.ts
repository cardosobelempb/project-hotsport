import { UUIDVO } from "@/core";
import { Prisma, type Token } from "@/generated/prisma";

import { TokenEntity } from "../../domain/entities/token.entity";

export class TokenPrismaMapper {
  static toDomain(raw: Token): TokenEntity {
    return TokenEntity.create({
      id: UUIDVO.create(raw.id),
      userId: UUIDVO.create(raw.userId),
      accessToken: raw.accessToken,
      refreshToken: raw.refreshToken,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
    });
  }

  static toPrisma(entity: TokenEntity): Prisma.TokenUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      accessToken: entity.accessToken,
      refreshToken: entity.refreshToken,
      expiresAt: entity.expiresAt || new Date(),
      createdAt: entity.createdAt,
    };
  }
}
