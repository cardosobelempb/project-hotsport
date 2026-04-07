import { SearchInput, SearchOutput } from './Search'
import { SoftDeletable } from './SoftDeletable'
import { SoftDeleteRepository } from './SoftDeleteRepository'

/**
 * Repositório com busca paginada e soft delete.
 */
export abstract class SearchableSoftDeleteRepository<
  TEntity extends SoftDeletable,
> extends SoftDeleteRepository<TEntity> {
  /**
   * Busca entidades ativas por padrão.
   *
   * ⚠️ Não deve retornar registros com deletedAt != null
   */
  abstract search(params: SearchInput): Promise<SearchOutput<TEntity>>
}
