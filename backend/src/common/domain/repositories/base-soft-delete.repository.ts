import { BaseSoftDeletableRepository } from "./base-soft-deletable.repository";
import { BaseRepository } from "./base.repository";

/**
 * Repositório com suporte a soft delete.
 */
export abstract class BaseSoftDeleteRepository<
  TEntity extends BaseSoftDeletableRepository,
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
