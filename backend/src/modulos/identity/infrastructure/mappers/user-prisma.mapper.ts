import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { User as PrismaUser } from "../../../../../generated/prisma";

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UserDto } from "../../application/dto/user.dto";
import { UserEntity } from "../../domain/entities/user.entity";

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.create(
      {
        email: EmailVO.create(raw.email || ""),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: UserEntity): UserDto {
    return {
      id: entity.id.toString(),
      email: entity.email.getValue().value,
      passwordHash: entity.passwordHash?.getValue(),
    };
  }

  static toPrisma(entity: UserEntity): PrismaUser {
    return {
      id: entity.id.getValue(),

      email: entity.email.getValue().value,
      passwordHash: entity.passwordHash?.getValue() || null,
      emailVerified: entity.emailVerified,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
