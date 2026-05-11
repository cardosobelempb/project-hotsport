// ─── Factory ─────────────────────────────────────────────────────────────────

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipStatus } from "@/common/shared/enums/member-ship-status.enum";
import { MembershipEntity } from "../../domain/entities/member-ship.entity";
import { CreateMembershipDto } from "../dto/member-ship.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class MembershipFactory {
  /**
   * Cria a membership do usuário como OWNER do tenant.
   *
   * ⚠️ TODO: revisar `organizationId` e `invitedById` conforme regra de negócio.
   */
  static build(dto: CreateMembershipDto): MembershipEntity {
    return MembershipEntity.create({
      userId: UUIDVO.create(dto.userId),
      tenantId: UUIDVO.create(dto.tenantId),
      organizationId: UUIDVO.create(dto.tenantId), // ⚠️ Revisar: organização = tenant no registro inicial?
      invitedById: UUIDVO.create(dto.userId), // ⚠️ Revisar: auto-convite no registro inicial?
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
      joinedAt: new Date(),
      invitedEmail: EmailVO.create(dto.invitedEmail),
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
