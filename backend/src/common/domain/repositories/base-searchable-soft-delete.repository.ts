import { BaseSoftDeletableRepository } from "./base-soft-deletable.repository";
import { BaseSoftDeleteRepository } from "./base-soft-delete.repository";
import { SearchInput, SearchOutput } from "./search.repository";

/**
 * Repositório com busca paginada e soft delete.
 */
export abstract class BaseSearchableSoftDeleteRepository<
  TEntity extends BaseSoftDeletableRepository,
> extends BaseSoftDeleteRepository<TEntity> {
  /**
   * Busca entidades ativas por padrão.
   *
   * ⚠️ Não deve retornar registros com deletedAt != null
   */
  abstract search(params: SearchInput): Promise<SearchOutput<TEntity>>;
}
