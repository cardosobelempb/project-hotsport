import { PageRepository } from "@/common/domain/repositories/page-repository";

export abstract class UpdateRepository<T> extends PageRepository<T> {
  abstract findLatest(): Promise<T | null>;
  abstract markAsApplied(updateId: string): Promise<void>;
}
