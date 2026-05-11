import { PageRepository } from "@/common/domain/repositories/page-repository";
import { UserProfileEntity } from "../entities/user-profile.entity";

export abstract class UserProfileRepository extends PageRepository<UserProfileEntity> {
  // abstract findByEmail(email: string): Promise<UserProfileEntity | null>;
  // abstract existsByEmail(email: string): Promise<boolean>;
  // abstract updatePasswordHash(
  //   userprofileId: string,
  //   passwordHash: string,
  // ): Promise<void>;
  // abstract markEmailAsVerified(userprofileId: string): Promise<void>;
  // abstract softDelete(userprofileId: string): Promise<void>;
}
