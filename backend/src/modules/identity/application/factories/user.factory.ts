// ─── Factory ─────────────────────────────────────────────────────────────────

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserDto } from "../dto/user.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class UserFactory {
  /**
   * Cria a entidade de usuário com e-mail e senha já hasheada.
   */
  static build({ email, passwordHash }: CreateUserDto): UserEntity {
    return UserEntity.create({
      email: EmailVO.create(email),
      passwordHash: PasswordVO.create(passwordHash),
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
