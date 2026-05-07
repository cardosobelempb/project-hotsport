import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MemberShipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MemberShipStatus } from "@/common/shared/enums/member-ship-status.enum";

export interface MemberShipProps {
  userId: UUIDVO;
  tenantId: UUIDVO;
  organizationId: UUIDVO;
  invitedById: UUIDVO;
  role: MemberShipRole;
  status: MemberShipStatus;
  joinedAt: Date | null;
  invitedEmail: EmailVO;
  createdAt: Date;
  expiresAt: Date | null;
  removedAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MemberShipEntity extends BaseAggregate<MemberShipProps> {
  get userId() {
    return this.props.userId;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get organizationId() {
    return this.props.organizationId;
  }

  get invitedById() {
    return this.props.invitedById;
  }

  get role() {
    return this.props.role;
  }

  get status() {
    return this.props.status;
  }

  get joinedAt() {
    return this.props.joinedAt;
  }

  get invitedEmail() {
    return this.props.invitedEmail;
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

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MemberShipProps,
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "expiresAt"
      | "removedAt"
      | "joinedAt"
    >,
    id?: UUIDVO,
  ) {
    return new MemberShipEntity(
      {
        ...props,
        expiresAt: props.expiresAt ?? null,
        removedAt: props.removedAt ?? null,
        joinedAt: props.joinedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
