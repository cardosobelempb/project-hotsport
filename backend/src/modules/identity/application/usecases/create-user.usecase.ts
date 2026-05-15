import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { BcryptHasher } from "@/common/shared/cryptography/bcrypt-hasher";
import { PrismaUserRepository } from "../../infrastructure/database/prisma-user.repository";
import { CreateUserDto, UserResponseDto } from "../dto/user.dto";
import { UserFactory } from "../factories/user.factory";
import { UserMapper } from "../mappers/user-mapper";

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

    const entity = UserFactory.build({
      email: input.email,
      passwordHash: await this.hasher.hash(input.passwordHash),
    });

    const user = await this.userRepository.create(entity);
    const userDto = UserMapper.toHttp(user);

    return right(userDto);
  }
}
