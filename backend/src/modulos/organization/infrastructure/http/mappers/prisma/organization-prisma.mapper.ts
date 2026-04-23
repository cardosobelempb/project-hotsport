import {
  Prisma,
  Organization as PrismaOrganization,
} from "../../../../../../../generated/prisma";

import { SlugVO } from "@/core/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import { OrganizationStatus } from "@/modulos/organization/domain/enums/organization.enum";

export class OrganizationPrismaMapper {
  static toDomain(raw: PrismaOrganization): OrganizationEntity {
    return OrganizationEntity.create(
      {
        name: raw.name,
        slug: SlugVO.create(raw.slug),
        logoUrl: raw.logoUrl,
        status: raw.status as OrganizationStatus,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(
    entity: OrganizationEntity,
  ): Prisma.OrganizationUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl ?? null,
      status: entity.status as OrganizationStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toUpdatePersistence(
    entity: OrganizationEntity,
  ): Prisma.OrganizationUncheckedUpdateInput {
    return {
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl ?? null,
      status: entity.status as OrganizationStatus,
      updatedAt: entity.updatedAt,
    };
  }
}
