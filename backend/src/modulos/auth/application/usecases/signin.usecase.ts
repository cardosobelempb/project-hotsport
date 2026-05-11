import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { NotAllwedError } from "@/common/domain/errors/usecases/not-allwed.error";

import { BaseEncrypter } from "@/common/shared/auth/base-encrypter";
import { BaseBcryptHasher } from "@/common/shared/cryptography/base-bcrypt-hasher";
import { UserEntity } from "@/modulos/identity/domain/entities/user.entity";
import { MembershipMapper } from "@/modulos/identity/domain/mappers/member-ship.mapper";
import { UserMapper } from "@/modulos/identity/domain/mappers/user-mapper";
import { MembershipRepository } from "@/modulos/identity/domain/repositories/member-ship.repository";
import { UserRepository } from "@/modulos/identity/domain/repositories/user.repository";
import { TokenRepository } from "../../domain/repositories/token-repository";
import { SigninBodyDto, SigninDto } from "../dto/signin.dto";

export type SigninUseCaseResponse = Either<
  AlreadyExistsError | NotAllwedError | BadRequestError,
  SigninDto
>;

export class SigninUseCase {
  static inject = [
    UserRepository,
    MembershipRepository,
    TokenRepository,
    BaseBcryptHasher,
    BaseEncrypter,
  ];

  constructor(
    private readonly usersRepository: UserRepository,
    private readonly membershipsRepository: MembershipRepository,
    private readonly tokensRepository: TokenRepository,
    private readonly hasher: BaseBcryptHasher,
    private readonly jwt: BaseEncrypter,
  ) {}

  async execute(input: SigninBodyDto): Promise<SigninUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(input.email);

    if (!user || user.deletedAt !== null) {
      return left(
        new NotAllwedError({
          message: `User with email ${input.email} does not exist`,
          fieldName: "email",
        }),
      );
    }

    const isPasswordValid = await this.hasher.compare(
      input.passwordHash,
      user.passwordHash.getValue(),
    );

    const password = new PasswordVO(input.passwordHash, this.hasher);
    const passwordHash = await password.hash();

    if (!isPasswordValid) {
      return left(
        new BadRequestError({
          message: `Invalid password`,
          fieldName: "passwordHash",
        }),
      );
    }

    const memberships =
      await this.membershipsRepository.findActiveRolesByUserId(
        user.id.getValue(),
      );

    const accessToken = await this.jwt.encryptAccessToken({
      sub: user.id,
      email: user.email,
      memberships: memberships.map((m) => MembershipMapper.toHttp(m)),
    });

    const refreshToken = await this.jwt.encryptRefreshToken({
      sub: user.id.getValue(),
    });

    const entity = UserEntity.create({
      email: EmailVO.create(input.email),
      passwordHash: new PasswordVO(passwordHash),
    });

    // const refreshTokenHash = hashToken(refreshToken);

    // const token = TokenEntity.create({
    //   userId: user.id,
    //   type: TokenType.REFRESH,
    //   valueHash: refreshTokenHash,
    //   expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    // });

    // await this.tokensRepository.create(token);

    return right({
      user: UserMapper.toSummary(entity),
      memberships: memberships.map((m) => MembershipMapper.toSummary(m)),
      accessToken,
      refreshToken,
      expiresIn: 60 * 60, // 1 hora em segundos
    });
  }
}
