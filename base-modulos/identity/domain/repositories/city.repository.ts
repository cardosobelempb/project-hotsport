import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de State.
 * Estados brasileiros (quase imutável - leitura principal).
 */
export abstract class StateRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByUf(uf: string): Promise<T | null>;
  abstract findByName(name: string): Promise<T | null>;
  abstract listAllActive(): Promise<T[]>;
}
