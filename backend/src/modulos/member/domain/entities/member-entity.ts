import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects";
import { MemberRole } from "../emuns/member-roles.enum";
import { CannotDemoteOwnerError } from "../erros/cannot-demote-owner.error";

export interface MemberProps {
  organizationId: UUIDVO;
  userId: UUIDVO;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date | null;
}

export class MemberEntity extends BaseAggregate<MemberProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get userId() {
    return this.props.userId;
  }

  get role() {
    return this.props.role;
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

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<MemberProps, "role" | "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new MemberEntity(
      {
        ...props,
        role: props.role ?? MemberRole.OPERATOR,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
