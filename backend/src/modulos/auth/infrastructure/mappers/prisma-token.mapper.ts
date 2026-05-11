import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Token as PrismaToken } from "../../../../../generated/prisma";

import { TokenType } from "@/common/shared/enums/token-type.enum";
import { TokenDto } from "../../application/dto/token.dto";
import { TokenEntity } from "../../domain/entities/token.entity";

export class PrismaTokenMapper {
  static toDomain(raw: PrismaToken): TokenEntity {
    return TokenEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        valueHash: raw.valueHash,
        expiredAt: raw.expiredAt,
        revokedAt: raw.revokedAt,
        type: raw.type as TokenType,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: TokenEntity): TokenDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue().toString(),
      valueHash: entity.valueHash,
      type: entity.type,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      expiredAt: entity.expiredAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  static toPrisma(entity: TokenEntity): PrismaToken {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue().toString(),
      valueHash: entity.valueHash,
      type: entity.type as TokenType,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      revokedAt: entity.revokedAt,
      expiredAt: entity.expiredAt,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
