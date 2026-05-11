// domain/user/repositories/user.repository.ts

import { PageRepository } from "@/common/domain/repositories/page-repository";
import { UserEntity } from "../entities/user.entity";

/**
 * Contrato de persistência do domínio de Usuários.
 *
 * ✅ `this.prisma` disponível aqui — herdado via cadeia:
 *    UserRepository → PageRepository → BaseRepository → PrismaRepository
 *
 * ✅ Sem redeclaração de `prisma`
 * ✅ Sem construtor duplicado
 */
export abstract class UserRepository extends PageRepository<UserEntity> {
  // 👇 this.prisma está acessível aqui sem nenhuma redeclaração
  // Exemplo de uso em métodos concretos futuros:
  // protected async exemplo() {
  //   return this.prisma.user.findMany(); // ✅ funciona normalmente
  // }

  /** Busca um usuário pelo endereço de e-mail. */
  abstract findByEmail(email: string): Promise<UserEntity | null>;

  /** Verifica se já existe um usuário com o e-mail informado. */
  abstract existsByEmail(email: string): Promise<boolean>;

  /** Atualiza o hash da senha do usuário sem retornar a entidade. */
  abstract updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void>;

  /** Marca o e-mail do usuário como verificado. */
  abstract markEmailAsVerified(userId: string): Promise<void>;

  /**
   * Remove logicamente o usuário (soft delete).
   * Prefira este método ao `delete` físico para manter rastreabilidade.
   */
  abstract softDelete(userId: string): Promise<void>;
}
