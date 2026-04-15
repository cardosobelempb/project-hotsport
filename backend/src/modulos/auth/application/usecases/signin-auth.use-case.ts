import { BaseHashComparer } from "@/core/domain/common/shared/base-hash-comparer";
import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { CodeError } from "@/core/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/core/domain/errors/usecases/unauthorized.error";
import { MemberRepository } from "@/modulos/member/domain/repositories/member.repository";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";
import { UserRepository } from "@/modulos/user/domain/repositories/user.repository";
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
    private readonly memberRepository: MemberRepository,
    private readonly organizarionRepository: OrganizationRepository,
    private readonly accountRepository: AccountRepository,
    private readonly hashCompare: BaseHashComparer,
    private readonly jwtTokenUseCase: JwtTokenProvider,
  ) {}

  async execute({
    email,
    password,
  }: AuthLoginUseCaseInput): Promise<AuthLoginUseCaseResult> {
    const account = await this.accountRepository.findByEmail(email);
    if (!account) return left(new UnauthorizedError(CodeError.UNAUTHORIZED));

    const user = await this.userRepository.findById(account.userId.toString());
    if (!user) return left(new UnauthorizedError(CodeError.UNAUTHORIZED));

    const isPasswordValid = await this.hashCompare.compare(
      password,
      account.passwordHash ?? "",
    );

    if (!isPasswordValid) {
      return left(new UnauthorizedError(CodeError.UNAUTHORIZED));
    }

    const organization = await this.organizarionRepository.findById(
      user.id.toString(),
    );

    if (!organization) {
      return left(new UnauthorizedError(CodeError.UNAUTHORIZED));
    }

    const member = await this.memberRepository.findById(user.id.toString());
    console.log("Member encontrado:", member?.userId.toString());
    if (!user) return left(new UnauthorizedError(CodeError.UNAUTHORIZED));

    const { accessToken, refreshToken } =
      await this.jwtTokenUseCase.generateTokens(user.id.toString());

    return right({
      message: "Login realizado com sucesso",
      accessToken,
      refreshToken,
    });
  }
}
