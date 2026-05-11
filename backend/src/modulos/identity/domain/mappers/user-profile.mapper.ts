import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
  UserProfileResponseDto,
  UserProfileSummaryDto,
} from "../../application/dto/user-profile.dto";
import { UserProfileEntity } from "../entities/user-profile.entity";

// ============================================================
// userprofile.mapper.ts
// Responsabilidade: converter UserProfileEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → UserProfileResponseDto  (pós-criação)
//   toUpdatedResponse  → UserProfileResponseDto  (pós-atualização)
//   toSummary          → UserProfileSummaryDto   (listagem paginada)
//   toHttp             → UserProfileResponseDto  (detalhes completos)
// ============================================================

export class UserProfileMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: UserProfileEntity): CreateUserProfileDto {
    return {
      userId: entity.userId.getValue(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      displayName: entity.displayName,
      fullName: entity.fullName,
      birthDate: entity.birthDate,
      status: entity.status,
      phone: entity.phone.getValue(),
      avatarUrl: entity.avatarUrl,
      documentType: entity.documentType,
      documentNumber: entity.documentNumber,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(UserProfileMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: UserProfileEntity): CreateUserProfileDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(UserProfileMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: UserProfileEntity): UpdateUserProfileDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, UserProfileMapper.toSummary);

  static toSummary(entity: UserProfileEntity): UserProfileSummaryDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue(),
      displayName: entity.displayName,
      fullName: entity.fullName,
      status: entity.status,
      avatarUrl: entity.avatarUrl,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: UserProfileEntity): UserProfileResponseDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      displayName: entity.displayName,
      fullName: entity.fullName,
      birthDate: entity.birthDate,
      phone: entity.phone.getValue(),
      avatarUrl: entity.avatarUrl,
      status: entity.status,
      documentType: entity.documentType,
      documentNumber: entity.documentNumber,
      createdAt: entity.createdAt,
    };
  }
}
