import { PageRepository } from "@/common/domain/repositories/page-repository";
import { TokenType } from "@/common/shared/enums/token-type.enum";
import { TokenEntity } from "@/modulos/identity/domain/entities/token.entity";

/**
 * Repositório abstrato de Token.
 * Gerencia tokens internos (refresh, reset password, API keys, etc).
 */
export abstract class TokenRepository extends PageRepository<TokenEntity> {
  // ====================== BUSCAS ======================
  abstract findValidByUserAndType(
    userId: string,
    type: TokenType,
  ): Promise<TokenEntity | null>;
  abstract findByValueHash(valueHash: string): Promise<TokenEntity | null>;

  // ====================== OUTROS ======================
  abstract revokeToken(valueHash: string): Promise<void>;
  abstract revokeAllByUser(userId: string): Promise<void>;
  abstract expireToken(id: string): Promise<void>;
}
