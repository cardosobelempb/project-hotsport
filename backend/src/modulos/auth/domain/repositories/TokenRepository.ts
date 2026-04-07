import { RepositorySearchable } from "@/core";
import { TokenEntity } from "../entities/token.entity";

export abstract class TokenRepository extends RepositorySearchable<TokenEntity> {
  // abstract findByEmail(email: string): Promise<boolean | null>;
  // abstract findByCpf(cpf: string): Promise<boolean | null>;
}
