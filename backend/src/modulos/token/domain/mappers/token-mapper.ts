import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { TokenOutputDto, TokenRawDto } from "../../application/dto/token.dto";
import { TokenEntity } from "../entities/token.entity";

export class TokenMapper {
  static toDomain(raw: TokenRawDto): TokenEntity {
    return TokenEntity.create(
      {
        tokenId: raw.tokenId,
        refreshToken: raw.refreshToken,
        accessToken: raw.accessToken,
        expiresAt: new Date(raw.expiresAt),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: TokenEntity): TokenOutputDto {
    return {
      id: entity.id.getValue(),
      tokenId: entity.tokenId,
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
