import { LgpdConsent as PrismaLgpdConsent } from "../../../../../generated/prisma";

import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { LgpdConsentEntity } from "../../domain/entities/lgpd-consent.entity";

export class LgpdConsentMapper {
  static toDomain(raw: PrismaLgpdConsent): LgpdConsentEntity {
    return LgpdConsentEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        organizationId: UUIDVO.create(raw.organizationId),
        consentTerms: raw.consentTerms,
        consentMarketing: raw.consentMarketing,
        consentDataSharing: raw.consentDataSharing,
        consentAnalytics: raw.consentAnalytics,
        ipAddress: raw.ipAddress,
        macAddress: raw.macAddress,
        userAgent: raw.userAgent,
        consentVersion: raw.consentVersion,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersist(entity: LgpdConsentEntity) {
    return {
      id: entity.id.toString(),
      userId: entity.userId.getValue(),
      organizationId: entity.organizationId.getValue(),
      consentTerms: entity.consentTerms,
      consentMarketing: entity.consentMarketing,
      consentDataSharing: entity.consentDataSharing,
      consentAnalytics: entity.consentAnalytics,
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      userAgent: entity.userAgent,
      consentVersion: entity.consentVersion,
    };
  }

  static toOutput(entity: LgpdConsentEntity) {
    return {
      id: entity.id.toString(),
      userId: entity.userId.getValue(),
      organizationId: entity.organizationId.getValue(),
      consentTerms: entity.consentTerms,
      consentMarketing: entity.consentMarketing,
      consentDataSharing: entity.consentDataSharing,
      consentAnalytics: entity.consentAnalytics,
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      userAgent: entity.userAgent,
      consentVersion: entity.consentVersion,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
