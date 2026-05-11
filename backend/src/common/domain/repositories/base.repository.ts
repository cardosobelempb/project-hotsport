// domain/repositories/base.repository.ts

import { PrismaRepository } from "@/common/infrastructure/db/prisma-repository";

/**
 * Contrato base de persistência para todas as entidades do domínio.
 *
 * ✅ NÃO redeclara `prisma` — já herdado de PrismaRepository
 * ✅ NÃO repete o construtor — super() já resolve
 *
 * @template TEntity - Entidade de domínio gerenciada
 */
export abstract class BaseRepository<TEntity> extends PrismaRepository {
  // ✅ Sem redeclaração de `prisma` — vive apenas em PrismaRepository
  // ✅ Sem construtor duplicado — herdado automaticamente

  /** Busca uma entidade pelo ID. Retorna null se não encontrada. */
  abstract findById(id: string): Promise<TEntity | null>;

  /** Busca múltiplas entidades por lista de IDs. */
  abstract findManyByIds(ids: string[]): Promise<TEntity[]>;

  /** Persiste uma nova entidade na base de dados. */
  abstract create(entity: TEntity): Promise<TEntity>;

  /** Verifica se uma entidade existe pelo ID. */
  abstract exists(id: string): Promise<boolean>;

  /**
   * Atualiza o estado de uma entidade existente.
   * Segue o padrão "save" do Spring Data — mesmo método para insert/update.
   */
  abstract save(entity: TEntity): Promise<TEntity>;

  /**
   * Remove fisicamente a entidade da base.
   * ⚠️ Prefira softDelete sempre que possível para manter auditoria.
   */
  abstract delete(entity: TEntity): Promise<void>;
}
