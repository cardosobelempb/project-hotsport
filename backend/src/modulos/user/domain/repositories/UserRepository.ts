import { RepositorySearchable } from "@/core";

import { UserEntity } from "../entities/user.entity";

export abstract class UserRepository extends RepositorySearchable<UserEntity> {
  // abstract findByEmail(email: string): Promise<boolean | null>;
  abstract findByCpf(cpf: string): Promise<boolean | null>;
}
