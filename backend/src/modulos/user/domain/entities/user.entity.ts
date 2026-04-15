import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { CpfVO } from "@/core/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/core/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/core/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { UserStatus } from "../enums/user-status.enum";

export interface UserProps {
  firstName: string;
  lastName: string;
  email: EmailVO;
  cpf: CpfVO;
  phoneNumber: PhoneVO | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export class UserEntity extends BaseAggregate<UserProps> {
  // GETTERS

  get firstName() {
    return this.props.firstName;
  }
  get lastName() {
    return this.props.lastName;
  }
  get email(): EmailVO {
    return this.props.email;
  }
  get cpf(): CpfVO {
    return this.props.cpf;
  }
  get phoneNumber(): PhoneVO | null {
    return this.props.phoneNumber;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  // PRIVATE

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  // DOMAIN RULES

  activate(): void {
    if (this.isActive) return;

    this.props.status = UserStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    if (this.props.status === UserStatus.INACTIVE) return;

    this.props.status = UserStatus.INACTIVE;
    this.touch();
  }

  block(): void {
    if (this.props.status === UserStatus.BLOCKED) return;

    this.props.status = UserStatus.BLOCKED;
    this.touch();
  }

  // DERIVED STATE

  get isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  // FACTORY

  static create(
    props: Optional<
      UserProps,
      "phoneNumber" | "createdAt" | "updatedAt" | "status"
    >,
    id?: UUIDVO,
  ): UserEntity {
    return new UserEntity(
      {
        ...props,
        phoneNumber: props.phoneNumber ?? null,
        status: props.status ?? UserStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null, // ✅ CORREÇÃO
      },
      id,
    );
  }

  // SERIALIZAÇÃO SEGURA

  toJSON() {
    return {
      id: this.id.toString(),
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email.getValue(),
      cpf: this.cpf.getValue(),
      phoneNumber: this.phoneNumber?.getValue() ?? null,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
