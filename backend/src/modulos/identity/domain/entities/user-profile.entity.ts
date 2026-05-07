import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { DateOfBirthVO } from "@/common/domain/values-objects/date-time/birth/date-of-birth-vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { DocumentType } from "@/common/shared/enums/document-type.enum";
import { UserProfileStatus } from "@/common/shared/enums/lead-status.enum";

export interface UserProfileProps {
  userId: UUIDVO;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  fullName: string | null;
  birthDate: DateOfBirthVO | null;
  phone: PhoneVO | null;
  avatarUrl: string | null;
  documentType: DocumentType | null;
  documentNumber: string | null;
  status: UserProfileStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class UserProfileEntity extends BaseEntity<UserProfileProps> {
  get userId() {
    return this.props.userId;
  }

  get firstName() {
    return this.props.firstName;
  }

  get lastName() {
    return this.props.lastName;
  }

  get fullName() {
    return this.props.fullName;
  }

  get displayName() {
    return this.props.displayName;
  }

  get birthDate() {
    return this.props.birthDate;
  }

  get phone() {
    return this.props.phone;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get documentType() {
    return this.props.documentType;
  }

  get documentNumber() {
    return this.props.documentNumber;
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

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<
      UserProfileProps,
      "status" | "createdAt" | "updatedAt" | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
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
