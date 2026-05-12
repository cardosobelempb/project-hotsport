import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { TenantStatus } from "@/common/shared/enums/tenant-atatus.enum";

export interface TenantProps {
  name: string;
  slug: string;
  documentNumber: string | null;
  contactEmail: string | null;
  phone: string | null;
  status?: TenantStatus;
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
  get status() {
    return this.props.status ?? TenantStatus.TRIALING;
  }

  activate(): void {
    this.props.status = TenantStatus.ACTIVE;
    this.touch();
  }
  suspend(): void {
    this.props.status = TenantStatus.SUSPENDED;
    this.touch();
  }
  cancel(): void {
    this.props.status = TenantStatus.CANCELED;
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
    return this.status === TenantStatus.ACTIVE && !this.isDeleted();
  }
  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
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
