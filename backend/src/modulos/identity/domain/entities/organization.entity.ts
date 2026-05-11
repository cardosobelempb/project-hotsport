import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { OrganizationStatus } from "@/common/shared/enums/organization-status-scope.enum";

export interface OrganizationProps {
  tenantId: UUIDVO;
  name: string;
  slug: SlugVO;
  logoUrl: string | null;
  status: OrganizationStatus;
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
    if (this.props.status === OrganizationStatus.ACTIVE) {
      return;
    }

    this.props.status = OrganizationStatus.ACTIVE;
    this.touch();
  }

  inactive() {
    if (this.props.status === OrganizationStatus.INACTIVE) {
      return;
    }

    this.props.status = OrganizationStatus.INACTIVE;
    this.touch();
  }

  delete() {
    if (this.props.status === OrganizationStatus.DELETED) {
      return;
    }

    this.props.status = OrganizationStatus.DELETED;
    this.props.deletedAt = new Date();
    this.touch();
  }

  changeName(name: string) {
    if (this.props.name === name) {
      return;
    }

    this.props.name = name;
    this.touch();
  }

  changeSlug(slug: SlugVO) {
    if (this.props.slug.equals(slug)) {
      return;
    }

    this.props.slug = slug;
    this.touch();
  }

  static create(
    props: Optional<
      OrganizationProps,
      "status" | "logoUrl" | "createdAt" | "updatedAt" | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new OrganizationEntity(
      {
        ...props,
        logoUrl: props.logoUrl ?? null,
        status: props.status ?? OrganizationStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
