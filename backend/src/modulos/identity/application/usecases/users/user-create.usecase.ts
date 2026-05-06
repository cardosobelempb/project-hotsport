import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { BcryptHasher } from "@/common/shared/cryptography/bcrypt-hasher";
import { UserEntity } from "@/modulos/identity/domain/entities/user.entity";
import { UserMapper } from "@/modulos/identity/domain/mappers/user-mapper";
import { PrismaUserRepository } from "@/modulos/identity/infrastructure/http/repositories/prisma/prisma-user.repository";
import { CreateUserDto, UserResponseDto } from "../../dto/user.dto";

export type UserCreateUseCaseResponse = Either<
  AlreadyExistsError,
  UserResponseDto
>;

export class UserCreateUseCase {
  static inject = [PrismaUserRepository, BcryptHasher];

  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly hasher: BcryptHasher,
  ) {
    this.userRepository = userRepository;
    this.hasher = hasher;
  }

  async execute(input: CreateUserDto): Promise<UserCreateUseCaseResponse> {
    if (!input.email || !input.passwordHash) {
      return left(
        new AlreadyExistsError({
          message: "User email is required",
          fieldName: "email",
        }),
      );
    }

    const existing = await this.userRepository.findByEmail(input.email);
    console.log("existing", existing);

    if (existing) {
      return left(
        new AlreadyExistsError({
          message: `User with email '${input.email}' already exists`,
          fieldName: "email",
        }),
      );
    }

    const entity = UserEntity.create({
      email: EmailVO.create(input.email),
      passwordHash: new PasswordVO(input.passwordHash, this.hasher),
    });

    const user = await this.userRepository.create(entity);
    const userDto = UserMapper.toHttp(user);

    return right(userDto);
  }
}
