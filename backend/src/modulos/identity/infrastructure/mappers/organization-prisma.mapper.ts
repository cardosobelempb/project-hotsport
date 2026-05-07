import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Organization as PrismaOrganization } from "../../../../../generated/prisma";

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { DocumentType } from "@/common/shared/enums/document-type.enum";
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
        contactEmail: EmailVO.create(raw.contactEmail || ""),
        phone: PhoneVO.create(raw.phone || ""),
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
      contactEmail: entity.contactEmail.getValue().value,
      phone: entity.phone.getValue(),
      documentNumber: entity.documentNumber,
      documentType: entity.documentType as DocumentType | null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
      deletedAt: entity.deletedAt?.toISOString(),
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
      contactEmail: entity.contactEmail.getValue().value,
      phone: entity.phone.getValue(),
      documentNumber: entity.documentNumber,
      documentType: entity.documentType as DocumentType,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
