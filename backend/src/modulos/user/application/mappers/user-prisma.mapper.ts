import { UUIDVO } from "@/core";
import { Prisma, type User } from "@/generated/prisma";

import { UserEntity } from "../../domain/entities/user.entity";

export class UserPrismaMapper {
  static toDomain(raw: User): UserEntity {
    const userId = UUIDVO.create(raw.id);

    return UserEntity.create(
      {
        firstName: raw.firstName ?? "",
        lastName: raw.lastName ?? "",
        cpf: raw.cpf ?? "",
        phoneNumber: raw.phoneNumber ?? "",
      },
      userId,
    );
  }

  static toPrisma(entity: UserEntity): Prisma.UserUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber ?? null,
      cpf: entity.cpf,
    };
  }

  static toUpdatePrisma(entity: UserEntity): Prisma.UserUncheckedUpdateInput {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber,
    };
  }

  // ✅ Converte entidade → objeto de resposta HTTP (bate com UserPresentSchema)
  static toHttp(entity: UserEntity) {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      cpf: entity.cpf,
      phoneNumber: entity.phoneNumber,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
