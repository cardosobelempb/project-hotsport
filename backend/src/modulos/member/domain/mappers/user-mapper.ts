import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import {
  MemberOutputDto,
  MemberRawDto,
} from "../../application/dto/member.dto";
import { MemberEntity } from "../entities/member-entity";

export class MemberMapper {
  static toDomain(raw: MemberRawDto): MemberEntity {
    return MemberEntity.create(
      {
        organizationId: UUIDVO.create(raw.organizationId),
        userId: UUIDVO.create(raw.userId),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: MemberEntity): MemberOutputDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      userId: entity.userId.getValue(),
      role: entity.role,
      createdAt: new Date().toISOString(),
    };
  }
}
