// ============================================================
// member.mapper.ts
// Responsabilidade: converter MemberEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → MemberResponseDto  (pós-criação)
//   toUpdatedResponse  → MemberResponseDto  (pós-atualização)
//   toSummary          → MemberSummaryDto   (listagem paginada)
//   toHttp             → MemberResponseDto  (detalhes completos)
// ============================================================

import {
  CreateMemberDto,
  MemberResponseDto,
  MemberSummaryDto,
  UpdateMemberDto,
} from "../../application/schemas/member.schema";
import { MemberEntity } from "../entities/member.entity";

export class MemberMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: MemberEntity): CreateMemberDto {
    return {
      organizationId: entity.organizationId.getValue(),
      userId: entity.userId.getValue(),
      role: entity.role,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(MemberMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: MemberEntity): CreateMemberDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(MemberMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: MemberEntity): UpdateMemberDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, MemberMapper.toSummary);

  static toSummary(entity: MemberEntity): MemberSummaryDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      userId: entity.userId.getValue(),
      email: entity.email.getValue().value,
      role: entity.role,
      invitationStatus: entity.invitationStatus,
      status: entity.status,
      joinedAt: entity.joinedAt,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: MemberEntity): MemberResponseDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      userId: entity.userId.getValue(),
      email: entity.email.getValue().value,
      invitationStatus: entity.invitationStatus,
      invitedBy: entity.invitedBy.getValue(),
      role: entity.role,
      status: entity.status,
      joinedAt: entity.joinedAt,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    };
  }
}
