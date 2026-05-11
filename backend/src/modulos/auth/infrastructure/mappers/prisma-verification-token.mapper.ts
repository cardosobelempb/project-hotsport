import { VerificationToken as PrismaVerificationToken } from "../../../../../generated/prisma";

import { VerificationTokenDto } from "../../application/dto/verification-token.dto";
import { VerificationTokenEntity } from "../../domain/entities/verification-token.entity";

export class PrismaVerificationTokenMapper {
  static toDomain(raw: PrismaVerificationToken): VerificationTokenEntity {
    return VerificationTokenEntity.create({
      identifier: raw.identifier,
      token: raw.token,
      expiredAt: raw.expiredAt,
    });
  }

  static toDTO(entity: VerificationTokenEntity): VerificationTokenDto {
    return {
      identifier: entity.identifier,
      token: entity.token,
      expiredAt: entity.expiredAt,
    };
  }

  static toPrisma(entity: VerificationTokenEntity): PrismaVerificationToken {
    return {
      identifier: entity.identifier,
      token: entity.token,
      expiredAt: entity.expiredAt,
    };
  }
}
