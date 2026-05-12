import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { UserProfileStatus } from "@/common/shared/enums/user-profile-status.enum";

export interface UserProfileProps {
  userId: UUIDVO;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  fullName: string | null;
  documentType: DocumentType | null;
  documentNumber: string | null;
  phone: string | null;
  birthDate: Date | null;
  avatarUrl: string | null;
  status?: UserProfileStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class UserProfileEntity extends BaseEntity<UserProfileProps> {
  get userId() {
    return this.props.userId;
  }
  get fullName() {
    return this.props.fullName;
  }
  get status() {
    return this.props.status ?? UserProfileStatus.ACTIVE;
  }

  activate(): void {
    this.props.status = UserProfileStatus.ACTIVE;
    this.touch();
  }
  deactivate(): void {
    this.props.status = UserProfileStatus.INACTIVE;
    this.touch();
  }
  softDelete(): void {
    this.props.deletedAt = new Date();
    this.touch();
  }
  restore(): void {
    this.props.deletedAt = null;
    this.touch();
  }

  isActive(): boolean {
    return this.status === UserProfileStatus.ACTIVE && !this.isDeleted();
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      UserProfileProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ): UserProfileEntity {
    return new UserProfileEntity(
      {
        ...props,
        status: props.status ?? UserProfileStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
