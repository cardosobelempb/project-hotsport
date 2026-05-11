import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MemberShip as PrismaMemberShip } from "../../../../../generated/prisma";

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { MemberShipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MemberShipStatus } from "@/common/shared/enums/member-ship-status.enum";
import { MemberShipDto } from "../../application/dto/member-ship.dto";
import { MemberShipEntity } from "../../domain/entities/member-ship.entity";

export class PrismaMemberShipMapper {
  static toDomain(raw: PrismaMemberShip): MemberShipEntity {
    return MemberShipEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        tenantId: UUIDVO.create(raw.tenantId),
        organizationId: UUIDVO.create(raw.organizationId || ""),
        invitedById: UUIDVO.create(raw.invitedById || ""),
        role: raw.role as MemberShipRole,
        status: raw.status as MemberShipStatus,
        joinedAt: raw.joinedAt,
        invitedEmail: EmailVO.create(raw.invitedEmail || ""),
        createdAt: raw.createdAt,
        expiredAt: raw.expiredAt,
        removedAt: raw.removedAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: MemberShipEntity): MemberShipDto {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      tenantId: entity.tenantId.toString(),
      organizationId: entity.organizationId.toString(),
      invitedById: entity.invitedById.toString(),
      role: entity.role,
      status: entity.status,
      joinedAt: entity.joinedAt,
      invitedEmail: entity.invitedEmail.getValue().value,
      createdAt: entity.createdAt,
      expiredAt: entity.expiredAt,
      deletedAt: entity.deletedAt,
      removedAt: entity.removedAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPrisma(entity: MemberShipEntity): PrismaMemberShip {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue(),
      tenantId: entity.tenantId.getValue(),
      organizationId: entity.organizationId.getValue(),
      invitedById: entity.invitedById.getValue(),
      role: entity.role,
      status: entity.status,
      joinedAt: entity.joinedAt,
      invitedEmail: entity.invitedEmail.getValue().value,
      createdAt: entity.createdAt,
      expiredAt: entity.expiredAt,
      removedAt: entity.removedAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
