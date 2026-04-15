import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { SlugVO } from "@/core/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";

export interface OrganizationProps {
  name: string;
  slug: SlugVO;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
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
      "logoUrl" | "createdAt" | "updatedAt" | "isActive"
    >,
    id?: UUIDVO,
  ) {
    return new OrganizationEntity(
      {
        ...props,
        logoUrl: props.logoUrl ?? null,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
      },
      id,
    );
  }
}
