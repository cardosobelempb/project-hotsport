import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { TenantStatus } from "@/common/shared/enums/tenant-atatus.enum";

export interface TenantProps {
  name: string;
  slug: SlugVO;
  documentNumber: string;
  contactEmail: EmailVO;
  phone: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class TenantEntity extends BaseAggregate<TenantProps> {
  get name() {
    return this.props.name;
  }

  get slug() {
    return this.props.slug;
  }

  get documentNumber() {
    return this.props.documentNumber;
  }

  get contactEmail() {
    return this.props.contactEmail;
  }

  get phone() {
    return this.props.phone;
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

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      TenantProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new TenantEntity(
      {
        ...props,
        status: props.status ?? TenantStatus.TRIALING,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
