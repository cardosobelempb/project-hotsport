import { PageRepository } from "@/common/domain/repositories/page-repository";
import { TokenType } from "@/common/shared/enums/token-type.enum";
import { TokenEntity } from "@/modulos/identity/domain/entities/token.entity";

export abstract class TokenRepository extends PageRepository<TokenEntity> {
  abstract findValidByHash(params: {
    valueHash: string;
    type: TokenType;
  }): Promise<TokenEntity | null>;
  abstract revokeById(tokenId: string): Promise<void>;
  abstract revokeAllByUserId(userId: string, type?: TokenType): Promise<void>;
  abstract deleteExpired(): Promise<number>;
}
