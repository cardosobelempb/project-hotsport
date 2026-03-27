import { Repository } from './Repository'
import { SearchInput, SearchOutput } from './Search'

/**
 * Extensão opcional para repositórios que suportam busca paginada.
 */
export abstract class SearchableRepository<
  TEntity,
> extends Repository<TEntity> {
  /**
   * Busca entidades de forma paginada.
   *
   * @param params Parâmetros de busca
   */
  abstract search(params: SearchInput): Promise<SearchOutput<TEntity>>
}
