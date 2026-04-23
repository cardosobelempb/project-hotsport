import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { TokenOutputDto, TokenRawDto } from "../../application/dto/token.dto";
import { TokenEntity } from "../entities/token.entity";

export class TokenMapper {
  static toDomain(raw: TokenRawDto): TokenEntity {
    return TokenEntity.create(
      {
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
      refreshToken: entity.refreshToken,
      accessToken: entity.accessToken,
      expiresAt: entity.expiresAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
