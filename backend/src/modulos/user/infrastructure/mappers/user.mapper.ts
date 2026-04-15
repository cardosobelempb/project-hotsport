import { User as PrismaUser } from "../../../../../generated/prisma";

import { CpfVO } from "@/core/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/core/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/core/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { CreateUserOutputDto } from "../../application/dto/create-user.output";
import { UserEntity } from "../../domain/entities/user.entity";

export class UserMapper {
  // 🔁 Prisma → Domain
  static toDomain(raw: PrismaUser): UserEntity {
    return UserEntity.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailVO.create(raw.email),
        cpf: new CpfVO(raw.cpf),
        phoneNumber: raw.phoneNumber ? PhoneVO.create(raw.phoneNumber) : null,
      },
      UUIDVO.create(raw.id),
    );
  }

  // 🔁 Domain → Prisma
  static toPersistence(
    entity: UserEntity,
  ): Omit<PrismaUser, "createdAt" | "updatedAt" | "status"> {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() || "",
    };
  }

  static toOutput(entity: UserEntity): CreateUserOutputDto {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() || "",
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
