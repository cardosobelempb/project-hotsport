import { ConflictError, Either, EmailVO, left, right, UUIDVO } from "@/core";
import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { UserRepository } from "@/modulos/user/domain/repositories/UserRepository";
import { AuthEntity } from "../../domain/entities/auth.entity";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

import { BcryptHasher } from "../../infrastructure/cryptography/bcrypt-hasher";
import {
  AuthRegisterBodyType,
  AuthRegisterResponseType,
} from "../../infrastructure/schemas/auth-register.schema";
import { AuthRegisterPrismaMapper } from "../mappers/auth-register-prisma.mapper";

export interface AuthRegisterUseCaseInput {
  email: string;
  password: string;
}

type AuthRegisterUseCaseOutput = AuthRegisterResponseType;

export type AuthRegisterUseCaseResult = Either<
  ConflictError,
  { user: AuthRegisterUseCaseOutput }
>;

export class AuthRegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly bcryptHasher: BcryptHasher = new BcryptHasher(),
  ) {}

  async execute({
    user,
    email,
    password, // ✅ senha plain text, hash feito aqui
  }: AuthRegisterBodyType): Promise<AuthRegisterUseCaseResult> {
    const [authWithSameEmail, userWithSameCpf] = await Promise.all([
      this.authRepository.findByEmail(email),
      this.userRepository.findByCpf(user.cpf),
    ]);

    if (userWithSameCpf) {
      return left(
        new ConflictError(`ValidatorMessage.DUPLICATE_VALUE: ${user.cpf}`),
      );
    }

    if (authWithSameEmail) {
      return left(
        new ConflictError(`ValidatorMessage.DUPLICATE_VALUE: ${email}`),
      );
    }

    const newUser = UserEntity.create({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      cpf: user.cpf,
    });

    const savedUser = await this.userRepository.save(newUser);

    const hashedPassword = await this.bcryptHasher.hash(password); // ✅ hash aqui

    const auth = AuthEntity.create({
      userId: UUIDVO.create(savedUser.id.getValue()),
      email: EmailVO.create(email),
      passwordHash: hashedPassword,
    });

    await this.authRepository.save(auth);

    return right({ user: AuthRegisterPrismaMapper.toHttp(savedUser) });
  }
}
