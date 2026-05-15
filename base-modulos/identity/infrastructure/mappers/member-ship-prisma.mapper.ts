import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Membership as PrismaMembership } from "../../../../../generated/prisma";

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipStatus } from "@/common/shared/enums/member-ship-status.enum";
import { MembershipEntity } from "@/modulos/tenant/domain/entities/member-ship.entity";
import { MembershipDto } from "../../application/dto/member-ship.dto";

export class PrismaMembershipMapper {
  static toDomain(raw: PrismaMembership): MembershipEntity {
    return MembershipEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        tenantId: UUIDVO.create(raw.tenantId),
        organizationId: UUIDVO.create(raw.organizationId || ""),
        invitedById: UUIDVO.create(raw.invitedById || ""),
        role: raw.role as MembershipRole,
        status: raw.status as MembershipStatus,
        joinedAt: raw.joinedAt,
        invitedEmail: EmailVO.create(raw.invitedEmail || ""),
        createdAt: raw.createdAt,
        expiresAt: raw.expiresAt,
        removedAt: raw.removedAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: MembershipEntity): MembershipDto {
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
      expiredAt: entity.expiresAt,
      deletedAt: entity.deletedAt,
      removedAt: entity.removedAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPrisma(entity: MembershipEntity): PrismaMembership {
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
      expiresAt: entity.expiresAt,
      removedAt: entity.removedAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
