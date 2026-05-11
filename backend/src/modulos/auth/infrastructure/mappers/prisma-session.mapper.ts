import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Session as PrismaSession } from "../../../../../generated/prisma";

import { SessionDto } from "../../application/dto/session.dto";
import { SessionEntity } from "../../domain/entities/session.entity";

export class PrismaSessionMapper {
  static toDomain(raw: PrismaSession): SessionEntity {
    return SessionEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        sessionToken: raw.sessionToken,
        expiredAt: raw.expiredAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: SessionEntity): SessionDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue().toString(),
      sessionToken: entity.sessionToken,
      expiredAt: entity.expiredAt,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPrisma(entity: SessionEntity): PrismaSession {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue().toString(),
      sessionToken: entity.sessionToken,
      expiredAt: entity.expiredAt,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
