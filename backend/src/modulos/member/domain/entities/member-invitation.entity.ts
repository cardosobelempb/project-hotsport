import { Optional } from "@/common/domain/types/Optional";

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MemberInvitationStatus } from "../emuns/member-invitation-status.enum";
import { MemberRole } from "../emuns/member-roles.enum";
import { MemberEntity, MemberProps } from "./member-entity";

export interface MemberInvitationEntityProps extends MemberProps {
  email: EmailVO;
  invitationStatus: MemberInvitationStatus;
  expiresAt: Date | null;
}

export class MemberInvitationEntity extends MemberEntity<MemberInvitationEntityProps> {
  get email() {
    return this.props.email;
  }

  get invitationStatus() {
    return this.props.invitationStatus;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  activeInvitation() {
    this.props.invitationStatus = MemberInvitationStatus.ACTIVE;
    this.touch();
  }

  acceptInvitation() {
    this.props.invitationStatus = MemberInvitationStatus.ACCEPTED;
    this.touch();
  }

  declineInvitation() {
    this.props.invitationStatus = MemberInvitationStatus.DECLINED;
    this.touch();
  }

  expireInvitation() {
    this.props.invitationStatus = MemberInvitationStatus.EXPIRED;
    this.touch();
  }

  removeInvitation() {
    this.props.invitationStatus = MemberInvitationStatus.REMOVED;
    this.touch();
  }

  static create(
    props: Optional<
      MemberInvitationEntityProps,
      "invitationStatus" | "expiresAt"
    >,
    id?: UUIDVO,
  ) {
    return new MemberInvitationEntity(
      {
        ...props,
        role: props.role ?? MemberRole.MEMBER,
        invitationStatus:
          props.invitationStatus ?? MemberInvitationStatus.ACCEPTED,
        expiresAt: props.expiresAt ?? null,
      },
      id,
    );
  }
}
