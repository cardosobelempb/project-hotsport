import { EmailVO, UUIDVO } from "@/core";
import { Prisma, type Auth } from "@/generated/prisma";

import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthRegisterResponseType } from "../../infrastructure/schemas/auth-register.schema";

export class AuthRegisterPrismaMapper {
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
  // Domain entities → resposta HTTP
  static toHttp(user: UserEntity): AuthRegisterResponseType {
    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      cpf: user.cpf,
      phoneNumber: user.phoneNumber,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
