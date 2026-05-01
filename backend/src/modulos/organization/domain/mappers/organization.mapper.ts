// ============================================================
// organization.mapper.ts
// Mappers: Domain → DTO para cada tipo de resposta
//
// ┌─────────────────────────────────────────────────────┐
// │  toCreate  → OrganizationPresentDto  (pós criação)  │
// │  toUpdate  → OrganizationPresentDto  (pós update)   │
// │  toPage    → OrganizationSummaryDto  (listagem)     │
// └─────────────────────────────────────────────────────┘
// ============================================================

import { OrganizationStatus } from "@/shared/enums/organization-status.enum";
import {
  OrganizationPresentDto,
  OrganizationSummaryDto,
} from "../../application/dto/organization.dto";
import { OrganizationEntity } from "../entities/organization.entity";

export class OrganizationMapper {
  // ─── Membro → DTO ─────────────────────────────────────────────────────

  /**
   * Mapeia um membro de domínio para DTO de apresentação.
   */
  // private static memberToDto(
  //   member: OrganizationMember,
  // ): OrganizationMemberPresentDto {
  //   return {
  //     id: member.id.toString(),
  //     userId: member.userId.toString(),
  //     role: member.role,
  //     joinedAt: member.joinedAt.toISOString(),
  //   };
  // }

  // ─── Resposta de criação ──────────────────────────────────────────────

  /**
   * Pós-criação: retorna entidade completa com membros.
   *
   * @example
   * // No use case de criação:
   * return right(OrganizationMapper.toCreate(organization));
   */
  static toCreate(entity: OrganizationEntity): OrganizationPresentDto {
    // const members = entity.members.currentList.map((m) => this.memberToDto(m));
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      status: entity.status as OrganizationStatus,
      logoUrl: entity.logoUrl,
      // members,
      // totalMembers: members.length,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt?.toDateString() ?? null,
      deletedAt: entity.deletedAt?.toDateString() ?? null,
    };
  }

  // ─── Resposta de atualização ──────────────────────────────────────────

  /**
   * Pós-update: igual ao create, mas sinaliza quais membros
   * foram adicionados/removidos (útil para auditoria/logs).
   *
   * @example
   * // No use case de update:
   * return right(OrganizationMapper.toUpdate(organization));
   */
  static toUpdate(entity: OrganizationEntity): OrganizationPresentDto {
    // Reutiliza toCreate — mesma estrutura de resposta
    // Aqui você pode enriquecer com campos de auditoria se necessário
    return this.toCreate(entity);
  }

  // ─── Item resumido para page ──────────────────────────────────────────

  /**
   * Listagem paginada: versão compacta sem array de membros,
   * apenas o total — evita over-fetching na listagem.
   *
   * @example
   * // No use case de page:
   * const page = PageResponseMapper.toDto(result, OrganizationMapper.toPage);
   */
  static toPage(entity: OrganizationEntity): OrganizationSummaryDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      status: entity.status as OrganizationStatus,
      // totalMembers: entity.members.currentList.length,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
