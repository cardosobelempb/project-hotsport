import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { OrganizationStatus } from "@/common/shared/enums/organization-status-scope.enum";

export interface OrganizationProps {
  tenantId: UUIDVO;
  name: string;
  slug: string;
  logoUrl: string | null;
  status?: OrganizationStatus;
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
  get status() {
    return this.props.status ?? OrganizationStatus.ACTIVE;
  }

  activate(): void {
    this.props.status = OrganizationStatus.ACTIVE;
    this.touch();
  }
  block(): void {
    this.props.status = OrganizationStatus.BLOCKED;
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
    return this.status === OrganizationStatus.ACTIVE && !this.isDeleted();
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      OrganizationProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new OrganizationEntity(
      {
        ...props,
        status: props.status ?? OrganizationStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
