import { BasePageable } from "./base-pageable";
import { BaseSort } from "./base-sort";

/**
 * Paginated response output
 */
export class BasePaginatedResponse<T> {
  constructor(
    public readonly content: T[],
    public readonly pageable: BasePageable,

    public readonly last: boolean,
    public readonly totalPages: number,
    public readonly totalElements: number,

    public readonly size: number,
    public readonly number: number,

    public readonly sort: BaseSort,

    public readonly first: boolean,
    public readonly numberOfElements: number,
    public readonly empty: boolean,
  ) {}

  static fromSearchOutput<T>(params: {
    items: T[];
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
  }): BasePaginatedResponse<T> {
    const { items, total, totalPages, currentPage, perPage, sortBy } = params;

    /**
     * Spring Boot usa página iniciando em 0
     */
    const pageNumber = Math.max(currentPage - 1, 0);

    const sort = new BaseSort(!!sortBy, !sortBy, !sortBy);

    const pageable = new BasePageable(
      pageNumber,
      perPage,
      sort,
      pageNumber * perPage,
      true,
      false,
    );

    return new BasePaginatedResponse<T>(
      items,
      pageable,

      currentPage >= totalPages,
      totalPages,
      total,

      perPage,
      pageNumber,

      sort,

      currentPage === 1,
      items.length,
      items.length === 0,
    );
  }
}
