import { BaseSort } from "./base-sort";

/**
 * Pageable metadata
 */
export class BasePageable {
  constructor(
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sort: BaseSort,
    public readonly offset: number,
    public readonly paged: boolean,
    public readonly unpaged: boolean,
  ) {}
}
