import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import {
  LgpdConsentOutputDto,
  LgpdConsentRawDto,
} from "../../application/dto/lgpd-consent.dto";
import { LgpdConsentEntity } from "../entities/lgpd-consent.entity";
import { LgpdConsentStatus } from "../enums/lgpd-consent-status.enum";

export class LgpdConsentMapper {
  static toDomain(raw: LgpdConsentRawDto): LgpdConsentEntity {
    return LgpdConsentEntity.create(
      {
        userId: UUIDVO.create(raw.lgpdconsentId),
        organizationId: UUIDVO.create(raw.organizationId),
        consentTerms: raw.consentTerms,
        consentMarketing: raw.consentMarketing,
        consentDataSharing: raw.consentDataSharing,
        consentAnalytics: raw.consentAnalytics,
        ipAddress: raw.ipAddress,
        macAddress: raw.macAddress,
        userAgent: raw.lgpdconsentAgent,
        consentVersion: raw.consentVersion,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: LgpdConsentEntity): LgpdConsentOutputDto {
    return {
      id: entity.id.getValue(),
      lgpdconsentId: entity.userId.getValue(),
      organizationId: entity.organizationId.getValue(),
      consentTerms: entity.consentTerms,
      consentMarketing: entity.consentMarketing,
      consentDataSharing: entity.consentDataSharing,
      consentAnalytics: entity.consentAnalytics,
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      lgpdconsentAgent: entity.userAgent,
      consentVersion: entity.consentVersion,
      status: entity.status as LgpdConsentStatus,
      withdrawnAt: entity.withdrawnAt ?? null,
    };
  }
}
