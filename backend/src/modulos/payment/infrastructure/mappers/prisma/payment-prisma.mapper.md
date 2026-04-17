import { Prisma, User as PrismaUser } from "../../../../../../generated/prisma";

import { CpfVO } from "@/core/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/core/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/core/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { CreateUserOutputDto } from "@/modulos/user/application/dto/create-user.output";

import { UserEntity } from "@/modulos/user/domain/entities/user.entity";

export class UserMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailVO.create(raw.email),
        cpf: CpfVO.create(raw.cpf),
        phoneNumber: raw.phoneNumber ? PhoneVO.create(raw.phoneNumber) : null,
        status: raw.status,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(entity: UserEntity): Prisma.UserUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toUpdatePersistence(
    entity: UserEntity,
  ): Prisma.UserUncheckedUpdateInput {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() ?? null,
      status: entity.status,
      updatedAt: entity.updatedAt,
    };
  }

  static toOutput(entity: UserEntity): CreateUserOutputDto {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() ?? "",
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
