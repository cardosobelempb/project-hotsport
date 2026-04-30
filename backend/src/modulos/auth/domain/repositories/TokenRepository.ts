import { BaseRepository } from "@/common/domain/repositories/base.repository";
import { TokenEntity } from "@/modulos/identity/domain/entities/token.entity";

export abstract class TokenRepository extends BaseRepository<TokenEntity> {
  // abstract findByEmail(email: string): Promise<boolean | null>;
  // abstract findByCpf(cpf: string): Promise<boolean | null>;
}
