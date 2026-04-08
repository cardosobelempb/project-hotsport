import { ConflictError, Either } from "@/core";
import { UserEntity } from "@/modulos/user/domain/entities/user.entity";

export type AuthSessionPresenter = Either<
  ConflictError,
  {
    user: UserEntity;
  }
>;
