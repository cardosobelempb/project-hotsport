import { Pagination } from './pagination';

export abstract class RepositoryAbstract<T> {
  abstract findById(id: string): Promise<T | null>
  abstract findAll(params: Pagination): Promise<T[]>
  abstract create(entity: T): Promise<void>
  abstract update(entity: T): Promise<void>
  abstract delete(entity: T): Promise<void>
}
