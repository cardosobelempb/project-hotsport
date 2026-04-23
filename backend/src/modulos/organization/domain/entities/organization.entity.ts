import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { SlugVO, UUIDVO } from "@/common/domain/values-objects";
import { OrganizationDto } from "../../application/dto/organization.dto";
import { OrganizationStatus } from "../enums/organization.enum";

export class OrganizationEntity extends BaseAggregate<OrganizationDto> {
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
      OrganizationDto,
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
