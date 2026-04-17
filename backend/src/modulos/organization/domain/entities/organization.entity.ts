import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { SlugVO } from "@/core/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { OrganizationStatus } from "../enums/organization.enum";

export interface OrganizationProps {
  name: string;
  slug: SlugVO;
  logoUrl: string | null;
  status: OrganizationStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class OrganizationEntity extends BaseAggregate<OrganizationProps> {
  get name() {
    return this.props.name;
  }
  get slug() {
    return this.props.slug;
  }
  get logoUrl() {
    return this.props.logoUrl;
  }
  get isActive() {
    return this.props.isActive;
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

  activate() {
    if (this.props.isActive) return;
    this.props.isActive = true;
    this.touch();
  }

  deactivate() {
    if (!this.props.isActive) return;
    this.props.isActive = false;
    this.touch();
  }

  static create(
    props: Optional<
      OrganizationProps,
      | "logoUrl"
      | "createdAt"
      | "updatedAt"
      | "isActive"
      | "status"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new OrganizationEntity(
      {
        ...props,
        logoUrl: props.logoUrl ?? null,
        status: props.status ?? OrganizationStatus.ACTIVE,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
        deletedAt: null,
      },
      id,
    );
  }
}
