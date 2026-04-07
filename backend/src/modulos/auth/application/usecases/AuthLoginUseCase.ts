import { ErrorCode, left, right, UnauthorizedError } from "@/core";
import { HashComparer } from "@/core/core/common";
import { UserRepository } from "@/modulos/user/domain/repositories/UserRepository";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthLoginBodyType } from "../../infrastructure/schemas/auth.login.schema";
import { AuthLoginPresenter } from "../../presentation/auth-login.present";
import { JwtTokenUseCase } from "./JwtTokenUseCase";

export class AuthLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly hashCompare: HashComparer,
    private readonly jwtTokenUseCase: JwtTokenUseCase, // ✅ injetar JWT encrypter
  ) {}

  async execute({
    email,
    password, // ✅ senha plain text, hash feito aqui
  }: AuthLoginBodyType): Promise<AuthLoginPresenter> {
    // 🔍 Busca usuário com auth
    const auth = await this.authRepository.findByEmail(email);
    if (!auth) return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));

    const user = await this.userRepository.findById(auth.userId);

    if (!user) return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));

    const isPasswordValid = await this.hashCompare.compare(
      password,
      auth.passwordHash || "", // passwordHash deve ser parte do UserEntity ou obtido via AuthRepository
    );

    if (!isPasswordValid) {
      return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));
    }

    if (auth.userId !== user.id.toString()) {
      return left(new UnauthorizedError(ErrorCode.UNAUTHORIZED));
    }

    const { accessToken, refreshToken } =
      await this.jwtTokenUseCase.generateTokens(user.id.toString());

    const result = {
      user, // ✅ transforma UserEntity em
      auth,
      accessToken,
      refreshToken,
    };

    return right(result);
  }
}
