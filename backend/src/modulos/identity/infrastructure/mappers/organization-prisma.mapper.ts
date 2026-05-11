import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Organization as PrismaOrganization } from "../../../../../generated/prisma";

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationStatus } from "@/common/shared/enums/organization-status.enum";
import { OrganizationDto } from "../../application/dto/organization.dto";
import { OrganizationEntity } from "../../domain/entities/organization.entity";

export class PrismaOrganizationMapper {
  static toDomain(raw: PrismaOrganization): OrganizationEntity {
    return OrganizationEntity.create(
      {
        tenantId: UUIDVO.create(raw.tenantId || ""),
        name: raw.name,
        slug: SlugVO.create(raw.slug),
        logoUrl: raw.logoUrl,
        status: raw.status as OrganizationStatus,
        // tenant: prismaOrg.tenant
        //   ? PrismaTenantMapper.toDomain(prismaOrg.tenant)
        //   : undefined,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: OrganizationEntity): OrganizationDto {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl,
      status: entity.status as OrganizationStatus,
    };
  }

  static toPrisma(entity: OrganizationEntity): PrismaOrganization {
    return {
      id: entity.id.getValue(),
      tenantId: entity.tenantId.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl,
      status: entity.status as OrganizationStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
