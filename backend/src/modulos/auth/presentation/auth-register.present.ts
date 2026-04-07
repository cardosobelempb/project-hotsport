import { ConflictError, Either } from "@/core";
import { UserEntity } from "@/modulos/user/domain/entities/user.entity";

export type AuthRegisterPresenter = Either<
  ConflictError,
  {
    user: UserEntity;
  }
>;
