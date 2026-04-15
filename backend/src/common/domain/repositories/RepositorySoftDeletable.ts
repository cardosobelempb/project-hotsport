import { RepositoryDomain } from './RepositoryDomain'
import { IRepositorySoftDeletable } from './IRepositorySoftDeletable'

/**
 * Repositório com suporte a soft delete.
 */
export abstract class RepositorySoftDelete<
  TEntity extends IRepositorySoftDeletable,
> extends RepositoryDomain<TEntity> {
  /**
   * Realiza exclusão lógica da entidade.
   */
  async softDelete(entity: TEntity): Promise<void> {
    entity.deletedAt = new Date()
    await this.save(entity)
  }

  /**
   * Restaura uma entidade excluída logicamente.
   */
  async restore(entity: TEntity): Promise<void> {
    entity.deletedAt = null
    await this.save(entity)
  }
}
