import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserSummaryDto,
} from "../../application/dto/user.dto";
import { UserEntity } from "../entities/user.entity";

// ============================================================
// user.mapper.ts
// Responsabilidade: converter UserEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → UserResponseDto  (pós-criação)
//   toUpdatedResponse  → UserResponseDto  (pós-atualização)
//   toSummary          → UserSummaryDto   (listagem paginada)
//   toHttp             → UserResponseDto  (detalhes completos)
// ============================================================

export class UserMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: UserEntity): CreateUserDto {
    return {
      email: entity.email.getValue().value,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(UserMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: UserEntity): CreateUserDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(UserMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: UserEntity): UpdateUserDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, UserMapper.toSummary);

  static toSummary(entity: UserEntity): UserSummaryDto {
    return {
      id: entity.id.getValue(),
      email: entity.email.getValue().value,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id.getValue(),
      email: entity.email.getValue().value ?? "",
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
