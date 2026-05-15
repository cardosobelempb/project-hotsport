// ─── Factory ─────────────────────────────────────────────────────────────────

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { OrganizationEntity } from "../../../tenant/domain/entities/organization.entity";
import { CreateOrganizationDto } from "../dto/organization.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class OrganizationFactory {
  /**
   * Cria a entidade de usuário com e-mail e senha já hasheada.
   */
  static build(dto: CreateOrganizationDto): OrganizationEntity {
    return OrganizationEntity.create({
      tenantId: UUIDVO.create(dto.tenantId),
      name: dto.name,
      slug: SlugVO.create(dto.slug),
      logoUrl: dto.logoUrl,
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
