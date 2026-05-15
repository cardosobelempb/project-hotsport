// ─── Factory ─────────────────────────────────────────────────────────────────

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { AccountEntity } from "../../domain/entities/account.entity";
import { CreateAccountDto } from "../dto/account.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class AccountFactory {
  /**
   * Cria a entidade de usuário com e-mail e senha já hasheada.
   */
  static build(dto: CreateAccountDto): AccountEntity {
    return AccountEntity.create({
      userId: UUIDVO.create(dto.userId),
      providerAccountId: UUIDVO.create(dto.providerAccountId),
      provider: dto.provider, // O provider é derivado do providerType
      refreshToken: dto.refreshToken,
      accessToken: dto.accessToken,
      expiresAt: dto.expiresAt,
      tokenType: dto.tokenType,
      scope: dto.scope,
      idToken: dto.idToken,
      sessionState: dto.sessionState,
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
