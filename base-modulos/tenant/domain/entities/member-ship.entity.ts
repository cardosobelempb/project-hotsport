import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipStatus } from "@/common/shared/enums/member-ship-status.enum";

export interface MembershipProps {
  userId: UUIDVO;
  tenantId: UUIDVO;
  organizationId: UUIDVO;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: Date;
  invitedEmail: EmailVO;
  invitedById: UUIDVO;
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
  get role() {
    return this.props.role;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get organizationId() {
    return this.props.organizationId;
  }
  get invitedEmail() {
    return this.props.invitedEmail;
  }
  get invitedById() {
    return this.props.invitedById;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }
  get joinedAt() {
    return this.props.joinedAt;
  }
  get removedAt() {
    return this.props.removedAt;
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
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "expiresAt"
      | "removedAt"
      | "status"
    >,
    id?: UUIDVO,
  ) {
    return new MembershipEntity(
      {
        ...props,
        status: props.status ?? MembershipStatus.ACTIVE,
        expiresAt: props.expiresAt ?? null,
        removedAt: props.removedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
