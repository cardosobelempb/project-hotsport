import { EmailVO, UUIDVO } from "@/core";
import { Prisma, type Auth } from "@/generated/prisma";

import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthResponseType } from "../../infrastructure/schemas/auth.schema";

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

  // Domain entities → resposta HTTP
  static toHttp(auth: UserEntity): AuthResponseType {
    return {
      user: {
        id: auth.id.toString(),
        firstName: auth.firstName,
        lastName: auth.lastName,
        cpf: auth.cpf,
        phoneNumber: auth.phoneNumber,
        status: auth.status,
        createdAt: auth.createdAt.toISOString(),
      },
    };
  }
}
