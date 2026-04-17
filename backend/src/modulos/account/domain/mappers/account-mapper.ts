import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import {
  AccountOutputDto,
  AccountRawDto,
} from "../../application/dto/account.dto";
import { AccountEntity } from "../entities/account.entity";

export class AccountMapper {
  static toDomain(raw: AccountRawDto): AccountEntity {
    return AccountEntity.create(
      {
        userId: UUIDVO.create(raw.accountId),
        providerAccountId: UUIDVO.create(raw.providerAccountId),
        provider: raw.provider,
        passwordHash: raw.passwordHash,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: AccountEntity): AccountOutputDto {
    return {
      id: entity.id.getValue(),
      accountId: entity.userId.getValue(),
      provider: entity.provider,
      providerAccountId: entity.providerAccountId.getValue(),
      passwordHash: entity.passwordHash,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
