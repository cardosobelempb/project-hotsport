import { Optional } from "@/core/domain/common/types";
import { BaseEntity } from "@/core/domain/domain/entities/base.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { MemberRole } from "../emuns/member-roles.enum";

export interface MemberProps {
  organizationId: UUIDVO;
  userId: UUIDVO;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date | null;
}

export class MemberEntity extends BaseEntity<MemberProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get userId() {
    return this.props.userId;
  }
  get role() {
    return this.props.role;
  }

  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  promoteToOwner() {
    this.props.role = MemberRole.OWNER;
    this.touch();
  }

  promoteToAdmin() {
    this.props.role = MemberRole.ADMIN;
    this.touch();
  }

  static create(
    props: Optional<MemberProps, "createdAt" | "updatedAt" | "role">,
    id?: UUIDVO,
  ) {
    return new MemberEntity(
      {
        ...props,
        role: props.role ?? MemberRole.OPERATOR,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
      },
      id,
    );
  }
}
