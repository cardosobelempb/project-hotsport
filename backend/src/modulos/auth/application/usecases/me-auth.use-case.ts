import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { UserRepository } from "@/modulos/user/domain/repositories/user.repository";
import { JwtTokenProvider } from "@/providers/token/jwt-token.provider";

import { BaseHashComparer } from "@/core/domain/common/shared/base-hash-comparer";
import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { CodeError } from "@/core/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/core/domain/errors/usecases/unauthorized.error";
import { AccountEntity } from "@/modulos/account/domain/entities/account.entity";
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
    if (!auth) return left(new UnauthorizedError(CodeError.UNAUTHORIZED));

    const user = await this.userRepository.findById(auth.userId.toString());
    if (!user) return left(new UnauthorizedError(CodeError.UNAUTHORIZED));

    const isPasswordValid = await this.hashCompare.compare(
      password,
      auth.passwordHash || "",
    );

    if (!isPasswordValid) {
      return left(new UnauthorizedError(CodeError.UNAUTHORIZED));
    }

    if (auth.userId.equals(user.id)) {
      return left(new UnauthorizedError(CodeError.UNAUTHORIZED));
    }

    const { accessToken, refreshToken } =
      await this.jwtTokenProvider.generateTokens(user.id.toString());

    return right({ user, auth, accessToken, refreshToken });
  }
}
