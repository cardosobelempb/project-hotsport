import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipStatus } from "@/common/shared/enums/member-ship-status.enum";

export interface MembershipProps {
  userId: UUIDVO;
  tenantId: UUIDVO;
  organizationId: UUIDVO | null;
  role: MembershipRole;
  status?: MembershipStatus;
  joinedAt: Date | null;
  invitedEmail: string | null;
  invitedById: UUIDVO | null;
  expiresAt: Date | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MembershipEntity extends BaseEntity<MembershipProps> {
  get userId() {
    return this.props.userId;
  }
  get status() {
    return this.props.status ?? MembershipStatus.ACTIVE;
  }

  activate(): void {
    this.props.status = MembershipStatus.ACTIVE;
    this.touch();
  }
  suspend(): void {
    this.props.status = MembershipStatus.SUSPENDED;
    this.touch();
  }
  remove(): void {
    this.props.status = MembershipStatus.REMOVED;
    this.props.removedAt = new Date();
    this.touch();
  }

  isActive(): boolean {
    return this.status === MembershipStatus.ACTIVE && !this.isDeleted();
  }
  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MembershipProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new MembershipEntity(
      {
        ...props,
        status: props.status ?? MembershipStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
