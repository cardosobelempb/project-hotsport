import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { CodeError } from "@/common/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";
import { BaseHashComparer } from "@/common/domain/shared/base-hash-comparer";

import { UserRepository } from "@/modulos/identity/domain/repositories/user.repository";
import { JwtTokenProvider } from "@/providers/token/jwt-token.provider";
import { AccountRepository } from "../../domain/repositories/AccountRepository";
import { AuthLoginResponseType } from "../../infrastructure/http/schemas/signin-auth.schema";

export interface AuthLoginUseCaseInput {
  email: string;
  password: string;
}

type AuthLoginUseCaseOutput = AuthLoginResponseType;

export type AuthLoginUseCaseResult = Either<
  UnauthorizedError,
  AuthLoginUseCaseOutput
>;

export class AuthLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly hashCompare: BaseHashComparer,
    private readonly jwtTokenUseCase: JwtTokenProvider,
  ) {}

  async execute({
    email,
    password,
  }: AuthLoginUseCaseInput): Promise<AuthLoginUseCaseResult> {
    const account = await this.accountRepository.findByEmail(email);
    if (!account)
      return left(
        new UnauthorizedError({
          fieldName: "account",
          message: `${CodeError.UNAUTHORIZED}: Invalid email or password`,
        }),
      );

    const user = await this.userRepository.findById(account.userId.toString());
    if (!user)
      return left(
        new UnauthorizedError({
          fieldName: "user",
          message: `${CodeError.UNAUTHORIZED}: Invalid email or password`,
        }),
      );

    const isPasswordValid = await this.hashCompare.compare(
      password,
      account.passwordHash ?? "",
    );

    if (!isPasswordValid) {
      return left(
        new UnauthorizedError({
          fieldName: "account",
          message: `${CodeError.UNAUTHORIZED}: Invalid email or password`,
        }),
      );
    }

    const { accessToken, refreshToken } =
      await this.jwtTokenUseCase.generateTokens(user.id.toString());

    return right({
      message: "Login realizado com sucesso",
      accessToken,
      refreshToken,
    });
  }
}
