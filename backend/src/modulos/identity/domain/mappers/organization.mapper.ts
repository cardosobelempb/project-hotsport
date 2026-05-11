import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  OrganizationSummaryDto,
  UpdateOrganizationDto,
} from "../../application/dto/organization.dto";
import { OrganizationEntity } from "../entities/organization.entity";

// ============================================================
// organization.mapper.ts
// Responsabilidade: converter OrganizationEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → OrganizationResponseDto  (pós-criação)
//   toUpdatedResponse  → OrganizationResponseDto  (pós-atualização)
//   toSummary          → OrganizationSummaryDto   (listagem paginada)
//   toHttp             → OrganizationResponseDto  (detalhes completos)
// ============================================================

export class OrganizationMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(
    entity: OrganizationEntity,
  ): CreateOrganizationDto {
    return {
      tenantId: entity.tenantId.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl,
      status: entity.status,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(OrganizationMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: OrganizationEntity): CreateOrganizationDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(OrganizationMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: OrganizationEntity): UpdateOrganizationDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, OrganizationMapper.toSummary);

  static toSummary(entity: OrganizationEntity): OrganizationSummaryDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.toString(),
      logoUrl: entity.logoUrl,
      status: entity.status,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: OrganizationEntity): OrganizationResponseDto {
    return {
      id: entity.id.getValue(),
      tenantId: entity.tenantId.getValue(),
      name: entity.name,
      slug: entity.slug.toString(),
      logoUrl: entity.logoUrl,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
