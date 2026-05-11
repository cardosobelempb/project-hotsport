import {
  CreateTenantDto,
  TenantResponseDto,
  TenantSummaryDto,
  UpdateTenantDto,
} from "../../application/dto/tenant.dto";
import { TenantEntity } from "../entities/tenant.entity";

// ============================================================
// tenant.mapper.ts
// Responsabilidade: converter TenantEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → TenantResponseDto  (pós-criação)
//   toUpdatedResponse  → TenantResponseDto  (pós-atualização)
//   toSummary          → TenantSummaryDto   (listagem paginada)
//   toHttp             → TenantResponseDto  (detalhes completos)
// ============================================================

export class TenantMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: TenantEntity): CreateTenantDto {
    return {
      name: entity.name,
      slug: entity.slug.getValue(),
      contactEmail: entity.contactEmail.getValue().value,
      phone: entity.phone,
      documentNumber: entity.documentNumber,
    };
  }
  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(TenantMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: TenantEntity): CreateTenantDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(TenantMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: TenantEntity): UpdateTenantDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, TenantMapper.toSummary);

  static toSummary(entity: TenantEntity): TenantSummaryDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      contactEmail: entity.contactEmail.getValue().value ?? "",
      phone: entity.phone,
      status: entity.status,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: TenantEntity): TenantResponseDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      documentNumber: entity.documentNumber,
      contactEmail: entity.contactEmail.getValue().value ?? "",
      phone: entity.phone,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
