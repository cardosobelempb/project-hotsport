import { EmailVO, UUIDVO } from "@/core";
import { Prisma, type Auth } from "@/generated/prisma";

import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { AuthEntity } from "../../domain/entities/auth.entity";

export class AuthPrismaMapper {
  static toDomain(raw: Auth): AuthEntity {
    return AuthEntity.create({
      id: UUIDVO.create(raw.id),
      userId: UUIDVO.create(raw.userId),
      email: EmailVO.create(raw.email),
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
    });
  }

  static toPrisma(entity: AuthEntity): Prisma.AuthUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      email: entity.email.toString(),
      passwordHash: entity.passwordHash?.toString() ?? "",
      createdAt: entity.createdAt,
    };
  }

  static toUpdatePrisma(entity: AuthEntity): Prisma.AuthUncheckedUpdateInput {
    return {
      email: entity.email.toString(),
      passwordHash: entity.passwordHash?.toString() ?? "",
    };
  }

  // ✅ Converte entidade → objeto de resposta HTTP (bate com UserPresentSchema)
  static toHttp(entity: AuthEntity) {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      email: entity.email.toString(),
      passwordHash: entity.passwordHash?.toString() ?? "",
      createdAt: entity.createdAt.toISOString(),
    };
  }

  static toAuthAndUserHttp(auth: AuthEntity, user: UserEntity) {
    return {
      user: {
        id: auth.userId.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        cpf: user.cpf,
        phoneNumber: user.phoneNumber,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      id: auth.id.toString(),
      email: auth.email.toString(),
      passwordHash: auth.passwordHash?.toString() ?? "",
      createdAt: auth.createdAt.toISOString(),
    };
  }
}
