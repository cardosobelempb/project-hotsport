// ============================================================
// mikrotik.mapper.ts
// Responsabilidade: converter MikrotikEntity → DTOs de resposta
//
// Métodos públicos:
//   toCreatedResponse  → MikrotikResponseDto  (pós-criação)
//   toUpdatedResponse  → MikrotikResponseDto  (pós-atualização)
//   toSummary          → MikrotikSummaryDto   (listagem paginada)
//   toHttp             → MikrotikResponseDto  (detalhes completos)
// ============================================================

import {
  CreateMikrotikDto,
  MikrotikResponseDto,
  MikrotikSummaryDto,
  UpdateMikrotikDto,
} from "../../application/dto/mikrotik.dto";
import { MikrotikEntity } from "../entities/mikrotik-entity";

export class MikrotikMapper {
  // ─── Helper privado ───────────────────────────────────────────────────
  //
  // Centraliza a conversão dos campos comuns a create e update.
  // Evita duplicação (DRY) e garante consistência entre os dois mappers.
  //
  // ⚠️  Usamos ?? (nullish coalescing) e não || (OR lógico):
  //     entity.order pode ser 0  → || "" trataria como falsy (bug silencioso)
  //     entity.slug  pode ser "" → intencionalmente vazio, não deve virar null

  private static toCoreFields(entity: MikrotikEntity): CreateMikrotikDto {
    return {
      name: entity.name,
      host: entity.host,
      port: entity.port,
      username: entity.username,
      passwordHash: entity.passwordHash?.getValue(),
      ipAddress: entity.ipAddress.getValue(),
      macAddress: entity.macAddress.getValue(),
      organizationId: entity.organizationId.getValue(),
      activeUser: entity.activeUser,
      status: entity.status,
    };
  }

  // ─── Pós-criação ──────────────────────────────────────────────────────
  //
  // Retorna os campos persistidos imediatamente após o INSERT.
  // Ideal para confirmar ao cliente o que foi salvo.
  //
  // @example
  //   return right(MikrotikMapper.toCreatedResponse(entity));

  static toCreatedResponse(entity: MikrotikEntity): CreateMikrotikDto {
    return this.toCoreFields(entity);
  }

  // ─── Pós-atualização ─────────────────────────────────────────────────
  //
  // Retorna os campos após o UPDATE.
  // Estrutura idêntica ao create; separe aqui caso precise adicionar
  // campos de auditoria (updatedAt, updatedBy, changedFields…).
  //
  // @example
  //   return right(MikrotikMapper.toUpdatedResponse(entity));

  static toUpdatedResponse(entity: MikrotikEntity): UpdateMikrotikDto {
    return this.toCoreFields(entity);
  }

  // ─── Resumo para listagem paginada ───────────────────────────────────
  //
  // Versão compacta da entidade: expõe apenas o necessário para
  // renderizar uma linha de tabela/card, evitando over-fetching.
  //
  // @example
  //   const page = PageResponseMapper.toDto(result, MikrotikMapper.toSummary);

  static toSummary(entity: MikrotikEntity): MikrotikSummaryDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      username: entity.username,
      host: entity.host,
      port: entity.port,
      activeUser: entity.activeUser,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }

  // ─── Detalhes completos (GET by id / resposta HTTP) ───────────────────
  //
  // Payload completo enviado em endpoints de detalhe.
  // Inclui campos de auditoria (createdAt) ausentes no resumo.

  static toHttp(entity: MikrotikEntity): MikrotikResponseDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      host: entity.host,
      port: entity.port,
      username: entity.username,
      ipAddress: entity.ipAddress.getValue(),
      macAddress: entity.macAddress.getValue(),
      organizationId: entity.organizationId.getValue(),
      activeUser: entity.activeUser,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
