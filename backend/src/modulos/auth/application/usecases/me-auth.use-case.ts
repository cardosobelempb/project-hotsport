import { JwtTokenProvider } from "@/providers/token/jwt-token.provider";

import { CodeError } from "@/common/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { BaseHashComparer } from "@/common/domain/shared/base-hash-comparer";
import { AccountEntity } from "@/modulos/identity/domain/entities/account.entity";
import { UserEntity } from "@/modulos/identity/domain/entities/user.entity";
import { UserRepository } from "@/modulos/identity/domain/repositories/user.repository";
import { AccountRepository } from "../../domain/repositories/AccountRepository";
import { AuthLoginBodySchemaType } from "../../infrastructure/http/schemas/signin-auth.schema";

interface AuthUserUseCaseOutput {
  user: UserEntity;
  auth: AccountEntity;
  accessToken: string;
  refreshToken: string;
}

type AuthUserUseCaseResult = Either<UnauthorizedError, AuthUserUseCaseOutput>;

/**
 * @deprecated Use AuthLoginUseCase instead. This class is kept for reference only.
 */
export class AuthUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AccountRepository,
    private readonly hashCompare: BaseHashComparer,
    private readonly jwtTokenProvider: JwtTokenProvider,
  ) {}

  async execute({
    email,
    password,
  }: AuthLoginBodySchemaType): Promise<AuthUserUseCaseResult> {
    const auth = await this.authRepository.findByEmail(email);
    if (!auth)
      return left(
        new UnauthorizedError({
          fieldName: "account",
          message: `${CodeError.UNAUTHORIZED}: Invalid email or password`,
        }),
      );

    const user = await this.userRepository.findById(auth.userId.toString());
    if (!user)
      return left(
        new UnauthorizedError({
          fieldName: "user",
          message: `${CodeError.UNAUTHORIZED}: Invalid email or password`,
        }),
      );

    if (auth.userId.equals(user.id)) {
      return left(
        new UnauthorizedError({
          fieldName: "account",
          message: `${CodeError.UNAUTHORIZED}: Invalid email or password`,
        }),
      );
    }

    const { accessToken, refreshToken } =
      await this.jwtTokenProvider.generateTokens(user.id.toString());

    return right({ user, auth, accessToken, refreshToken });
  }
}
