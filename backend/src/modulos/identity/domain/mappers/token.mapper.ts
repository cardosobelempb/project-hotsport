import {
  CreateTokenDto,
  TokenResponseDto,
  TokenSummaryDto,
  UpdateTokenDto,
} from "../../../auth/application/dto/token.dto";
import { TokenEntity } from "../../../auth/domain/entities/token.entity";

// ============================================================
// token.mapper.ts
// Responsabilidade: converter TokenEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → TokenResponseDto  (pós-criação)
//   toUpdatedResponse  → TokenResponseDto  (pós-atualização)
//   toSummary          → TokenSummaryDto   (listagem paginada)
//   toHttp             → TokenResponseDto  (detalhes completos)
// ============================================================

export class TokenMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: TokenEntity): CreateTokenDto {
    return {
      userId: entity.userId.getValue(),
      type: entity.type,
      valueHash: entity.valueHash,
      expiredAt: entity.expiredAt,
      revokedAt: entity.revokedAt ?? null,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(TokenMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: TokenEntity): CreateTokenDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(TokenMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: TokenEntity): UpdateTokenDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, TokenMapper.toSummary);

  static toSummary(entity: TokenEntity): TokenSummaryDto {
    return {
      id: entity.id.getValue(),
      type: entity.type,
      expiredAt: entity.expiredAt,
      revokedAt: entity.revokedAt ?? null,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: TokenEntity): TokenResponseDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue(),
      type: entity.type,
      valueHash: entity.valueHash,
      expiredAt: entity.expiredAt,
      revokedAt: entity.revokedAt ?? null,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? null,
    };
  }
}
