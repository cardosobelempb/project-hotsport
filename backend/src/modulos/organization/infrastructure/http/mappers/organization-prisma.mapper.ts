import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import {
  OrganizationStatus,
  Prisma,
  Organization as PrismaOrganization,
} from "../../../../../../generated/prisma";

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";

export class OrganizationPrismaMapper {
  static toDomain(raw: PrismaOrganization): OrganizationEntity {
    return OrganizationEntity.create(
      {
        accountId: UUIDVO.create(raw.accountId),
        name: raw.name,
        slug: SlugVO.create(raw.slug),
        logoUrl: raw.logoUrl,
        createdAt: raw.createdAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(
    entity: OrganizationEntity,
  ): Prisma.OrganizationUncheckedCreateInput {
    return {
      id: entity.id.getValue(),
      accountId: entity.accountId.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl ?? null,
      status: entity.status as OrganizationStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? new Date(),
      deletedAt: entity.deletedAt,
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
      updatedAt: new Date(),
    };
  }
}
