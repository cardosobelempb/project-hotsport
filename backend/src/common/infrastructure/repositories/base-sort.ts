/**
 * Sort metadata
 */
export class BaseSort {
  constructor(
    public readonly sorted: boolean,
    public readonly unsorted: boolean,
    public readonly empty: boolean,
  ) {}
}
