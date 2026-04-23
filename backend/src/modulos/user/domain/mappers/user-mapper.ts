import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { UserOutputDto, UserRawDto } from "../../application/dto/user.dto";
import { UserEntity } from "../entities/user.entity";
import { UserStatus } from "../enums/user-status.enum";

export class UserMapper {
  static toDomain(raw: UserRawDto): UserEntity {
    return UserEntity.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailVO.create(raw.email),
        cpf: new CpfVO(raw.cpf),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: UserEntity): UserOutputDto {
    return {
      id: entity.id.getValue(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() ?? "",
      status: entity.status as UserStatus,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
