import { PageRepository } from "@/common/domain/repositories/page-repository";

/**
 * Repositório abstrato de EfiConfig.
 * Configurações da Efí (antiga Gerencianet) - PIX e cobranças.
 */
export abstract class EfiConfigRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByOrganization(organizationId: string): Promise<T | null>;
}
