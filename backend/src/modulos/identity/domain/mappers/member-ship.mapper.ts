import {
  CreateMembershipDto,
  MembershipResponseDto,
  MembershipSummaryDto,
  UpdateMembershipDto,
} from "../../application/dto/member-ship.dto";
import { MembershipEntity } from "../entities/member-ship.entity";

// ============================================================
// membership.mapper.ts
// Responsabilidade: converter MembershipEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → MembershipResponseDto  (pós-criação)
//   toUpdatedResponse  → MembershipResponseDto  (pós-atualização)
//   toSummary          → MembershipSummaryDto   (listagem paginada)
//   toHttp             → MembershipResponseDto  (detalhes completos)
// ============================================================

export class MembershipMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: MembershipEntity): CreateMembershipDto {
    return {
      userId: entity.userId.getValue(),
      tenantId: entity.tenantId.getValue(),
      organizationId: entity.organizationId.getValue(),
      invitedById: entity.invitedById?.getValue(),
      role: entity.role,
      status: entity.status,
      invitedEmail: entity.invitedEmail?.getValue().value,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(MembershipMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: MembershipEntity): CreateMembershipDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(MembershipMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: MembershipEntity): UpdateMembershipDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, MembershipMapper.toSummary);

  static toSummary(entity: MembershipEntity): MembershipSummaryDto {
    return {
      id: entity.id.getValue(),
      tenantId: entity.tenantId.getValue(),
      organizationId: entity.organizationId.getValue(),
      role: entity.role,
      status: entity.status,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: MembershipEntity): MembershipResponseDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue(),
      tenantId: entity.tenantId.getValue(),
      organizationId: entity.organizationId.getValue(),
      invitedById: entity.invitedById?.getValue() ?? null,
      role: entity.role,
      status: entity.status,
      joinedAt: entity.joinedAt,
      invitedEmail: entity.invitedEmail?.getValue().value ?? "",
      createdAt: entity.createdAt,
      expiredAt: entity.expiresAt ?? null,
      removedAt: entity.removedAt ?? null,
      updatedAt: entity.updatedAt ?? null,
    };
  }
}
