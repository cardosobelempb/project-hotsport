import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

export interface UserProps {
  email: EmailVO;
  emailVerified: Date | null;
  passwordHash: PasswordVO | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class UserEntity extends BaseAggregate<UserProps> {
  get email() {
    return this.props.email;
  }

  get emailVerified() {
    return this.props.emailVerified;
  }

  get passwordHash() {
    return this.props.passwordHash;
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
      UserProps,
      "createdAt" | "updatedAt" | "deletedAt" | "emailVerified" | "passwordHash"
    >,
    id?: UUIDVO,
  ) {
    return new UserEntity(
      {
        ...props,
        emailVerified: props.emailVerified ?? new Date(),
        passwordHash: props.passwordHash ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
