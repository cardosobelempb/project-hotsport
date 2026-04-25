import { BasePagination } from "./base-paginated";

export abstract class RepositoryAbstract<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(params: BasePagination): Promise<T[]>;
  abstract create(entity: T): Promise<void>;
  abstract update(entity: T): Promise<void>;
  abstract delete(entity: T): Promise<void>;
}
