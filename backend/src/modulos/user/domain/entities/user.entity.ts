import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { UserStatus } from "../enums/user-status.enum";

export interface UserProps {
  firstName: string;
  lastName: string;
  email: EmailVO;
  cpf: CpfVO;
  phoneNumber?: PhoneVO | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export class UserEntity extends BaseAggregate<UserProps> {
  get firstName() {
    return this.props.firstName;
  }
  get lastName() {
    return this.props.lastName;
  }

  get phoneNumber() {
    return this.props.phoneNumber;
  }

  get email() {
    return this.props.email;
  }

  get cpf() {
    return this.props.cpf;
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

  updateProfile(params: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: PhoneVO | null;
  }) {
    if (params.firstName !== undefined) this.props.firstName = params.firstName;
    if (params.lastName !== undefined) this.props.lastName = params.lastName;
    if (params.phoneNumber !== undefined)
      this.props.phoneNumber?.equals(params.phoneNumber);
    this.touch();
  }

  activate() {
    if (this.props.status === UserStatus.ACTIVE) return;
    this.props.status = UserStatus.ACTIVE;
    this.touch();
  }

  deactivate() {
    if (this.props.status === UserStatus.INACTIVE) return;
    this.props.status = UserStatus.INACTIVE;
    this.touch();
  }

  block() {
    if (this.props.status === UserStatus.BLOCKED) return;
    this.props.status = UserStatus.BLOCKED;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      UserProps,
      "phoneNumber" | "status" | "createdAt" | "updatedAt"
    >,
    id?: UUIDVO,
  ) {
    return new UserEntity(
      {
        ...props,
        phoneNumber: props.phoneNumber ?? null,
        status: props.status ?? UserStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
