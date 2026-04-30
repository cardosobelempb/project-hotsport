import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UserDto, UserPresenterDto } from "../../application/dto/user.dto";
import { UserStatusDto } from "../../application/dto/user/user-status.dto";
import { UserEntity } from "../entities/user.entity";

export class UserMapper {
  static toDomain(raw: UserDto): UserEntity {
    return UserEntity.create(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailVO.create(raw.email),
        cpf: new CpfVO(raw.cpf),
        phoneNumber: PhoneVO.create(raw.phoneNumber),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPresenter(entity: UserEntity): UserPresenterDto {
    return {
      id: entity.id.getValue(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email.getValue().value,
      cpf: entity.cpf.getValue(),
      phoneNumber: entity.phoneNumber?.getValue() ?? "",
      status: entity.status as UserStatusDto,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
