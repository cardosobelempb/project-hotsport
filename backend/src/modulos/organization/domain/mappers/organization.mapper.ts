import { SlugVO } from "@/core/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";

import { OrganizationPresentDto } from "../../application/dto/organization-present.dto";
import { OrganizationRawDto } from "../../application/dto/organization-raw.dto";
import { OrganizationEntity } from "../entities/organization.entity";

export class OrganizationMapper {
  static toDomain(raw: OrganizationRawDto): OrganizationEntity {
    return OrganizationEntity.create(
      {
        name: raw.name,
        slug: SlugVO.create(raw.slug),
        logoUrl: raw.logoUrl,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: OrganizationEntity): OrganizationPresentDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl ?? null,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
