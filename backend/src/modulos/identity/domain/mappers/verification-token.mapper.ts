import {
  CreateVerificationTokenDto,
  UpdateVerificationTokenDto,
  VerificationTokenResponseDto,
  VerificationTokenSummaryDto,
} from "../../../auth/application/dto/verification-token.dto";
import { VerificationTokenEntity } from "../../../auth/domain/entities/verification-token.entity";

// ============================================================
// verificationtoken.mapper.ts
// Responsabilidade: converter VerificationTokenEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → VerificationTokenResponseDto  (pós-criação)
//   toUpdatedResponse  → VerificationTokenResponseDto  (pós-atualização)
//   toSummary          → VerificationTokenSummaryDto   (listagem paginada)
//   toHttp             → VerificationTokenResponseDto  (detalhes completos)
// ============================================================

export class VerificationTokenMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(
    entity: VerificationTokenEntity,
  ): CreateVerificationTokenDto {
    return {
      identifier: entity.identifier.getValue(),
      tokenHash: entity.tokenHash,

      expiredAt: entity.expiredAt,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(VerificationTokenMapper.toCreatedResponse(entity));

  static toCreatedResponse(
    entity: VerificationTokenEntity,
  ): CreateVerificationTokenDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(VerificationTokenMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(
    entity: VerificationTokenEntity,
  ): UpdateVerificationTokenDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, VerificationTokenMapper.toSummary);

  static toSummary(
    entity: VerificationTokenEntity,
  ): VerificationTokenSummaryDto {
    return {
      id: entity.id.getValue(),
      identifier: entity.identifier.getValue(),
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: VerificationTokenEntity): VerificationTokenResponseDto {
    return {
      id: entity.id.getValue(),
      identifier: entity.identifier.getValue(),
      tokenHash: entity.tokenHash,
      usedAt: entity.usedAt,
      expiredAt: entity.expiredAt,
    };
  }
}
