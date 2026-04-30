import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import {
  Prisma,
  User as PrismaUser,
  UserStatus as PrismaUserStatus,
} from "../../../../../generated/prisma";

import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { UserEntity } from "@/modulos/identity/domain/entities/user.entity";
import { UserStatus } from "@/shared/enums/user-status.enum";

export class UserPrismaMapper {
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailVO.create(raw.email),
        cpf: new CpfVO(raw.cpf),
        phoneNumber: PhoneVO.create(raw.phoneNumber),
        status: raw.status as UserStatus,
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
      phoneNumber: entity.phoneNumber?.getValue() ?? "",
      status: entity.status as PrismaUserStatus,
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
      status: entity.status as PrismaUserStatus,
      updatedAt: entity.updatedAt,
    };
  }
}
