import { BasePagination } from "./pagination";

export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(params: BasePagination): Promise<T[]>;
  abstract create(entity: T): Promise<void>;
  abstract update(entity: T): Promise<void>;
  abstract delete(entity: T): Promise<void>;
}
