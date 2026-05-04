import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MemberInvitationStatus } from "@/shared/enums/member-invitation-status.enum";
import { MemberRole } from "@/shared/enums/member-role.enum";
import { MemberStatus } from "@/shared/enums/member-status.enum";

export interface MemberProps {
  organizationId: UUIDVO;
  userId: UUIDVO;
  email: EmailVO;
  role: MemberRole;
  status: MemberStatus;
  invitationStatus: MemberInvitationStatus;
  invitedBy: UUIDVO;
  joinedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MemberEntity extends BaseEntity<MemberProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get userId() {
    return this.props.userId;
  }

  get email() {
    return this.props.email;
  }

  get invitedBy() {
    return this.props.invitedBy;
  }

  get role() {
    return this.props.role;
  }

  get status() {
    return this.props.status;
  }

  get invitationStatus() {
    return this.props.invitationStatus;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get joinedAt() {
    return this.props.joinedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<
      MemberProps,
      | "expiresAt"
      | "invitationStatus"
      | "status"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new MemberEntity(
      {
        ...props,
        status: props.status ?? MemberStatus.ACTIVE,
        invitationStatus:
          props.invitationStatus ?? MemberInvitationStatus.ACCEPTED,
        expiresAt: props.expiresAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
