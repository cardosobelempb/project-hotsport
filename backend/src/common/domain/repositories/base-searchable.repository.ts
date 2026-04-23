import { BaseRepository } from "./base.repository";
import { SearchInput, SearchOutput } from "./search.repository";

/**
 * Extensão opcional para repositórios que suportam busca paginada.
 */
export abstract class BaseSearchableRepository<
  TEntity,
> extends BaseRepository<TEntity> {
  /**
   * Busca entidades de forma paginada.
   *
   * @param params Parâmetros de busca
   */
  abstract search(params: SearchInput): Promise<SearchOutput<TEntity>>;
}
