// ─── Factory ─────────────────────────────────────────────────────────────────

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { LgpdConsentsEntity } from "../../../auth/domain/entities/lgpd-consents.entity";
import { CreateLgpdConsentsDto } from "../dto/lgpd-consents.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class LgpdConsentFactory {
  /**
   * Cria o registro de consentimento LGPD com aceite completo.
   *
   * ⚠️ TODO: ipAddress, macAddress e userAgent devem vir do request HTTP.
   */
  static build(dto: CreateLgpdConsentsDto): LgpdConsentsEntity {
    return LgpdConsentsEntity.create({
      userId: UUIDVO.create(dto.userId),
      consentAnalytics: dto.consentAnalytics,
      consentDataSharing: dto.consentDataSharing,
      consentMarketing: dto.consentMarketing,
      consentTerms: dto.consentTerms,
      ipAddress: dto.ipAddress,
      macAddress: dto.macAddress,
      userAgent: dto.userAgent,
      consentVersion: dto.consentVersion,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 👇 Adicione novos builders aqui conforme o fluxo de registro evoluir
  // Exemplos futuros:
  //   static buildOnboardingChecklist(...)
  //   static buildDefaultNotificationSettings(...)
  //   static buildTrialSubscription(...)
  // ──────────────────────────────────────────────────────────────────────────
}
