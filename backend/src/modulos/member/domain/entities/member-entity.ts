import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MemberRole } from "../emuns/member-roles.enum";
import { MemberStatus } from "../emuns/member-status.enum";
import { CannotDemoteOwnerError } from "../erros/cannot-demote-owner.error";

export interface MemberProps {
  organizationId: UUIDVO;
  userId: UUIDVO;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  invitedBy: UUIDVO | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MemberEntity<
  Props extends MemberProps,
> extends BaseAggregate<Props> {
  get organizationId() {
    return this.props.organizationId;
  }

  get userId() {
    return this.props.userId;
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

  get invitedBy() {
    return this.props.invitedBy;
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

  activate() {
    this.props.status = MemberStatus.ACTIVE;
    this.touch();
  }

  deactivate() {
    this.props.status = MemberStatus.INACTIVE;
    this.touch();
  }

  block() {
    this.props.status = MemberStatus.BLOCKED;
    this.touch();
  }

  promoteToAdmin() {
    if (this.props.role === MemberRole.OWNER) return;
    this.props.role = MemberRole.ADMIN;
    this.touch();
  }

  transferOwnership() {
    this.props.role = MemberRole.OWNER;
    this.touch();
  }

  setOperator() {
    if (this.props.role === MemberRole.OWNER) {
      throw new CannotDemoteOwnerError("Cannot demote an owner to operator");
    }

    this.props.role = MemberRole.OPERATOR;
    this.touch();
  }

  touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MemberProps,
      "role" | "status" | "createdAt" | "updatedAt" | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new MemberEntity(
      {
        ...props,
        role: props.role ?? MemberRole.OPERATOR,
        status: props.status ?? MemberStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
