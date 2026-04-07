// auth.presenter.ts

import { ConflictError, Either } from "@/core";
import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { AuthEntity } from "../domain/entities/auth.entity";

export type AuthLoginPresenter = Either<
  ConflictError,
  {
    auth: AuthEntity;
    user: UserEntity;
    accessToken: string;
    refreshToken: string;
  }
>;
