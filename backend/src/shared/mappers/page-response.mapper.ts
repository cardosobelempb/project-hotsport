// ============================================================
// page-response.mapper.ts
// Mapper genérico: Page<TDomain> → PageResponseDto<TDto>
// ============================================================

import { Page } from "@/common/domain/repositories/types/pagination.types";
import { PageResponseDto } from "../dto/page-response.dto";

/**
 * Mapper genérico para transformar qualquer `Page<TDomain>`
 * em `PageResponseDto<TDto>`, substituindo apenas o content.
 *
 * @template TDomain - Tipo da entidade de domínio
 * @template TDto    - Tipo do DTO de apresentação
 *
 * @example
 * // No controller ou presenter:
 * const response = PageResponseMapper.toDto(
 *   page,
 *   (organization) => OrganizationMapper.toPresent(organization),
 * );
 */
export class PageResponseMapper {
  /**
   * Converte Page<TDomain> → PageResponseDto<TDto>
   * preservando todos os metadados Spring intactos.
   *
   * @param page      - Página retornada pelo use case
   * @param mapFn     - Função de transformação item a item
   */
  static toDto<TDomain, TDto>(
    page: Page<TDomain>,
    mapFn: (item: TDomain) => TDto,
  ): PageResponseDto<TDto> {
    return {
      // ─── Metadados Spring preservados intactos ─────────────────────
      pageable: page.pageable,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      last: page.last,
      size: page.size,
      number: page.number,
      sort: page.sort,
      numberOfElements: page.numberOfElements,
      first: page.first,
      empty: page.empty,

      // ─── Único campo transformado ──────────────────────────────────
      content: page.content.map(mapFn),
    };
  }
}
