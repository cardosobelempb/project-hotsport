// ============================================================
// PageRepository.ts
// Repositório abstrato com suporte a paginação no padrão Spring Boot.
// ============================================================

import { BaseRepository } from "./base.repository";
import { Page, PageInput } from "./types/pagination.types";

/**
 * Estende o repositório base com suporte à busca paginada,
 * seguindo o contrato do Spring Data Page.
 *
 * @template TEntity - Entidade de domínio gerenciada pelo repositório
 *
 * @example
 * class UserRepository extends PageRepository<User> {
 *   async page(params: SearchInput): Promise<Page<User>> {
 *     return this.httpClient.get('/users', { params });
 *   }
 * }
 *
 * // Consumo:
 * const result = await userRepository.page({ page: 0, size: 10, sort: 'name,asc' });
 * console.log(result.content);        // User[]
 * console.log(result.totalElements);  // 48
 * console.log(result.totalPages);     // 5
 * console.log(result.first);          // true
 */
export abstract class PageRepository<TEntity> extends BaseRepository<TEntity> {
  /**
   * Busca entidades de forma paginada.
   *
   * @param params - page, size e sort alinhados ao Spring PageableHandlerMethodArgumentResolver
   * @returns Página no formato Spring Data Page<TEntity>
   */
  abstract page(params: PageInput): Promise<Page<TEntity>>;
}
