import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";
import { TokenEntity } from "@/modulos/account/domain/entities/token.entity";

export abstract class TokenRepository extends BaseSearchableRepository<TokenEntity> {
  // abstract findByEmail(email: string): Promise<boolean | null>;
  // abstract findByCpf(cpf: string): Promise<boolean | null>;
}
