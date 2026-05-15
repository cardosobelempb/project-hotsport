import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { UserProfileStatus } from "@/common/shared/enums/user-profile-status.enum";

export interface UserProps {
  email: EmailVO;
  passwordHash: PasswordVO;
  emailVerified: Date | null;
  status?: UserProfileStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class UserEntity extends BaseAggregate<UserProps> {
  get email() {
    return this.props.email;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get emailVerified() {
    return this.props.emailVerified;
  }
  get status() {
    return this.props.status ?? UserProfileStatus.ACTIVE;
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
    if (this.status !== UserProfileStatus.ACTIVE) {
      this.props.status = UserProfileStatus.ACTIVE;
      this.touch();
    }
  }
  deactivate(): void {
    this.props.status = UserProfileStatus.INACTIVE;
    this.touch();
  }
  block(): void {
    this.props.status = UserProfileStatus.BLOCKED;
    this.touch();
  }
  softDelete(): void {
    if (!this.isDeleted()) {
      this.props.deletedAt = new Date();
      this.touch();
    }
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

  updateEmail(email: EmailVO): void {
    this.props.email = email;
    this.touch();
  }
  updatePassword(hash: PasswordVO): void {
    this.props.passwordHash = hash;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      UserProps,
      "createdAt" | "updatedAt" | "deletedAt" | "emailVerified" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new UserEntity(
      {
        ...props,
        emailVerified: props.emailVerified ?? null,
        status: props.status ?? UserProfileStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
