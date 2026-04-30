import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { OrganizationStatus } from "../enums/organization.enum";

interface OrganizationProps {
  name: string;
  slug: SlugVO;
  logoUrl: string | null;
  status: OrganizationStatus | null;
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

  suspend() {
    if (this.props.status === OrganizationStatus.SUSPENDED) {
      throw new BadRequestError({
        fieldName: "status",
        value: this.props.status,
        message: "Organization is already suspended",
      });
    }

    this.props.status = OrganizationStatus.SUSPENDED;
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

  changeLogoUrl(logoUrl: string | null): void {
    this.props.logoUrl = logoUrl;
    this.touch();
  }

  static create(
    props: Optional<
      OrganizationProps,
      "logoUrl" | "createdAt" | "updatedAt" | "status" | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new OrganizationEntity(
      {
        ...props,
        logoUrl: props.logoUrl ?? null,
        status: props.status ?? OrganizationStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
        deletedAt: null,
      },
      id,
    );
  }
}
