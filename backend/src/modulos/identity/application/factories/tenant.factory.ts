// ─── Factory ─────────────────────────────────────────────────────────────────

import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { TenantEntity } from "../../domain/entities/tenant.entity";
import { CreateTenantDto } from "../dto/tenant.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class TenantFactory {
  /**
   * Cria o tenant inicial vinculado ao usuário no momento do registro.
   */
  static build(dto: CreateTenantDto): TenantEntity {
    return TenantEntity.create({
      name: `${dto.name}'s Tenant`,
      slug: SlugVO.create(`${dto.slug}-tenant`),
      documentNumber: dto.documentNumber,
      contactEmail: EmailVO.create(dto.contactEmail),
      phone: dto.phone,
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
