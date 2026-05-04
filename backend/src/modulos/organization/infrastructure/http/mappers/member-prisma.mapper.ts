import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { MemberDto } from "@/modulos/organization/application/schemas/member.schema";
import { MemberEntity } from "@/modulos/organization/domain/entities/member.entity";
import { MemberInvitationStatus } from "@/shared/enums/member-invitation-status.enum";
import { MemberRole } from "@/shared/enums/member-role.enum";
import { MemberStatus } from "@/shared/enums/member-status.enum";
import { Member as PrismaMember } from "../../../../../../generated/prisma";

export class PrismaMemberMapper {
  static toDomain(raw: PrismaMember): MemberEntity {
    return MemberEntity.create(
      {
        organizationId: UUIDVO.create(raw.organizationId),
        userId: UUIDVO.create(raw.userId),
        email: EmailVO.create(raw.email),
        invitationStatus: raw.invitationStatus as MemberInvitationStatus,
        invitedBy: UUIDVO.create(raw.invitedBy || ""), // UUID nulo para convidados sem remetente
        role: raw.role as MemberRole,
        status: raw.status as MemberStatus,
        joinedAt: raw.joinedAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: MemberEntity): MemberDto {
    return {
      id: entity.id.toString(),
      organizationId: entity.organizationId.toString(),
      userId: entity.userId.toString(),
      email: entity.email.getValue().value,
      invitedBy: entity.invitedBy.toString(),
      role: entity.role,
      status: entity.status,
      invitationStatus: entity.invitationStatus,
      joinedAt: entity.joinedAt,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  static toPrisma(entity: MemberEntity): PrismaMember {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      userId: entity.userId.getValue(),
      invitedBy: entity.invitedBy.getValue(),
      email: entity.email.getValue().value,
      expiresAt: entity.expiresAt,
      invitationStatus: entity.invitationStatus,
      role: entity.role,
      status: entity.status,
      joinedAt: entity.joinedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
