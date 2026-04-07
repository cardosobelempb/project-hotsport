import { ConflictError, Either } from "@/core";
import { UserPresentType } from "@/modulos/user/infrastructure/schemas/user-register.schema";

export type AuthLoginResponse = Either<ConflictError, AuthLoginSuccess>;

export interface AuthLoginSuccess {
  user: UserPresentType;
  // auth: AuthPresentType;
  accessToken: string;
  refreshToken?: string;
}

export type AuthLoginPresenter = Either<
  ConflictError,
  {
    user: AuthLoginSuccess;
  }
>;
