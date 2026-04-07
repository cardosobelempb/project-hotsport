import { EmailVO, UUIDVO } from "@/core";
import { Prisma, type Auth } from "@/generated/prisma";

import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthLoginPresentType } from "../../infrastructure/schemas/auth.login.schema";

export class AuthLoginPrismaMapper {
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

  // Domain entities → resposta HTTP
  static toHttp(
    auth: AuthEntity,
    user: UserEntity,
    tokens: { accessToken: string; refreshToken?: string },
  ): AuthLoginPresentType {
    return {
      id: auth.id.toString(),
      userId: auth.userId.toString(),
      email: auth.email.toString(),
      createdAt: auth.createdAt.toISOString(),
      user: {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        cpf: user.cpf,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
