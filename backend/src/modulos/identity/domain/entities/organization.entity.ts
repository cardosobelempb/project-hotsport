import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { DocumentType } from "@/common/shared/enums/document-type.enum";
import { OrganizationStatus } from "@/common/shared/enums/organization-status.enum";

interface OrganizationProps {
  tenantId: UUIDVO;
  name: string;
  slug: SlugVO;
  documentNumber: string | null;
  documentType: DocumentType;
  contactEmail: EmailVO;
  phone: PhoneVO;
  status: OrganizationStatus;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class OrganizationEntity extends BaseAggregate<OrganizationProps> {
  get tenantId() {
    return this.props.tenantId;
  }
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get logoUrl() {
    return this.props.logoUrl;
  }
  get status() {
    return this.props.status;
  }
  get documentNumber() {
    return this.props.documentNumber;
  }
  get documentType() {
    return this.props.documentType;
  }
  get contactEmail() {
    return this.props.contactEmail;
  }
  get phone() {
    return this.props.phone;
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

  inactive() {
    if (this.props.status === OrganizationStatus.INACTIVE) {
      throw new BadRequestError({
        fieldName: "status",
        value: this.props.status,
        message: "Organization is already inactive",
      });
    }

    this.props.status = OrganizationStatus.INACTIVE;
    this.touch();
  }

  activate() {
    if (this.props.status === OrganizationStatus.ACTIVE) {
      throw new BadRequestError({
        fieldName: "status",
        value: this.props.status,
        message: "Organization is already active",
      });
    }

    this.props.status = OrganizationStatus.ACTIVE;
    this.touch();
  }

  blocled() {
    if (this.props.status === OrganizationStatus.BLOCKED) {
      throw new BadRequestError({
        fieldName: "status",
        value: this.props.status,
        message: "Organization is already bocked",
      });
    }

    this.props.status = OrganizationStatus.BLOCKED;
    this.touch();
  }

  changeName(name: string): void {
    this.props.name = name;
    this.touch();
  }

  changeSlug(slug: SlugVO): void {
    this.props.slug = slug;
    this.touch();
  }

  changeLogoUrl(logoUrl: string): void {
    this.props.logoUrl = logoUrl;
    this.touch();
  }

  static create(
    props: Optional<
      OrganizationProps,
      | "documentNumber"
      | "documentType"
      | "createdAt"
      | "updatedAt"
      | "status"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new OrganizationEntity(
      {
        ...props,
        status: props.status ?? OrganizationStatus.ACTIVE,
        documentType: props.documentType ?? DocumentType.CNPJ,
        documentNumber: props.documentNumber ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
        deletedAt: null,
      },
      id,
    );
  }
}
