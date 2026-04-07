import { RepositoryDomain } from './RepositoryDomain'
import { SearchInput, SearchOutput } from './RespositorySearch'

/**
 * Extensão opcional para repositórios que suportam busca paginada.
 */
export abstract class RepositorySearchable<
  TEntity,
> extends RepositoryDomain<TEntity> {
  /**
   * Busca entidades de forma paginada.
   *
   * @param params Parâmetros de busca
   */
  abstract search(params: SearchInput): Promise<SearchOutput<TEntity>>
}
