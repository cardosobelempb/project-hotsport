import { RepositorySearchable } from "@/core";
import { AuthEntity } from "../entities/auth.entity";

export abstract class AuthRepository extends RepositorySearchable<AuthEntity> {
  abstract findByEmail(email: string): Promise<AuthEntity | null>;
  abstract findByUserId(userId: string): Promise<AuthEntity | null>;
}
