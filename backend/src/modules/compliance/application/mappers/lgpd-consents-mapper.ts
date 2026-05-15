import { LgpdConsentsEntity } from "../../domain/entities/lgpd-consents.entity";
import {
  CreateLgpdConsentsDto,
  LgpdConsentsResponseDto,
  LgpdConsentsSummaryDto,
  UpdateLgpdConsentsDto,
} from "../dto/lgpd-consents.dto";

// ============================================================
// lgpdconsents.mapper.ts
// Responsabilidade: converter LgpdConsentsEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → LgpdConsentsResponseDto  (pós-criação)
//   toUpdatedResponse  → LgpdConsentsResponseDto  (pós-atualização)
//   toSummary          → LgpdConsentsSummaryDto   (listagem paginada)
//   toHttp             → LgpdConsentsResponseDto  (detalhes completos)
// ============================================================

export class LgpdConsentsMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(
    entity: LgpdConsentsEntity,
  ): CreateLgpdConsentsDto {
    return {
      userId: entity.userId.getValue().toString(),
      consentTerms: entity.consentTerms,
      consentMarketing: entity.consentMarketing,
      consentDataSharing: entity.consentDataSharing,
      consentAnalytics: entity.consentAnalytics,
      ipAddress: entity.ipAddress.getValue(),
      macAddress: entity.macAddress.getValue(),
      userAgent: entity.userAgent,
      consentVersion: entity.consentVersion,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(LgpdConsentsMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: LgpdConsentsEntity): CreateLgpdConsentsDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(LgpdConsentsMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: LgpdConsentsEntity): UpdateLgpdConsentsDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, LgpdConsentsMapper.toSummary);

  static toSummary(entity: LgpdConsentsEntity): LgpdConsentsSummaryDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue().toString(),
      consentTerms: entity.consentTerms,
      consentMarketing: entity.consentMarketing,
      consentVersion: entity.consentVersion,
      status: entity.status,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: LgpdConsentsEntity): LgpdConsentsResponseDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue().toString(),
      consentTerms: entity.consentTerms,
      consentMarketing: entity.consentMarketing,
      consentDataSharing: entity.consentDataSharing,
      consentAnalytics: entity.consentAnalytics,
      ipAddress: entity.ipAddress.getValue(),
      macAddress: entity.macAddress.getValue(),
      userAgent: entity.userAgent,
      consentVersion: entity.consentVersion,
      status: entity.status,
      withdrawnAt: entity.withdrawnAt,
      createdAt: entity.createdAt,
    };
  }
}
