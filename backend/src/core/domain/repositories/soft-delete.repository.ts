import { BaseRepository } from "./base.repository";
import { SoftDeletable } from "./soft-deletable.repository";

/**
 * Repositório com suporte a soft delete.
 */
export abstract class SoftDeleteRepository<
  TEntity extends SoftDeletable,
> extends BaseRepository<TEntity> {
  /**
   * Realiza exclusão lógica da entidade.
   */
  async softDelete(entity: TEntity): Promise<void> {
    entity.deletedAt = new Date();
    await this.save(entity);
  }

  /**
   * Restaura uma entidade excluída logicamente.
   */
  async restore(entity: TEntity): Promise<void> {
    entity.deletedAt = null;
    await this.save(entity);
  }
}
