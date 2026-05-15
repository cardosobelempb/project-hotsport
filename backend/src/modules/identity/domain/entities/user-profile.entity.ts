import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { BirthDateVO } from "@/common/domain/values-objects/date-time/birth/birth-date.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UrlVO } from "@/common/domain/values-objects/url/url.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { DocumentType } from "@/common/shared/enums/document-type.enum";
import { UserProfileStatus } from "@/common/shared/enums/user-profile-status.enum";

export interface UserProfileProps {
  userId: UUIDVO;
  firstName: string;
  lastName: string;
  displayName: string;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: PhoneVO;
  birthDate: BirthDateVO;
  avatarUrl: UrlVO;
  status: UserProfileStatus;
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

  get firstName() {
    return this.props.firstName;
  }
  get lastName() {
    return this.props.lastName;
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
      "createdAt" | "updatedAt" | "deletedAt" | "status" | "documentType"
    >,
    id?: UUIDVO,
  ): UserProfileEntity {
    return new UserProfileEntity(
      {
        ...props,
        documentType: props.documentType ?? DocumentType.CPF,
        status: props.status ?? UserProfileStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
