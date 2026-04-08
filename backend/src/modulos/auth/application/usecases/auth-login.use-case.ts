import { Either, ErrorCode, left, right, UnauthorizedError } from "@/core";
import { HashComparer } from "@/core/core/common";
import { UserRepository } from "@/modulos/user/domain/repositories/UserRepository";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthLoginResponseType } from "../../infrastructure/schemas/auth.login.schema";
import { JwtTokenUseCase } from "./JwtTokenUseCase";

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
    private readonly authRepository: AuthRepository,
    private readonly hashCompare: HashComparer,
    private readonly jwtTokenUseCase: JwtTokenUseCase,
  ) {}

  async execute({
    email,
    password,
  }: AuthLoginUseCaseInput): Promise<AuthLoginUseCaseResult> {
    const auth = await this.authRepository.findByEmail(email);
    if (!auth) return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));

    const user = await this.userRepository.findById(auth.userId);
    if (!user) return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));

    const isPasswordValid = await this.hashCompare.compare(
      password,
      auth.passwordHash ?? "",
    );

    if (!isPasswordValid) {
      return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));
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
