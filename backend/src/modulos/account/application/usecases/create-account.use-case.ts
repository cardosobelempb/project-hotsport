import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { UserRepository } from "@/modulos/user/domain/repositories/user.repository";
import { AccountEntity } from "../../domain/entities/account.entity";
import { AccountRepository } from "../../domain/repositories/account-repository";

import { prisma } from "@/shared/lib/db";
import { BcryptHasher } from "../../../../shared/cryptography/bcrypt-hasher";

import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { ConflictError } from "@/core/domain/errors/usecases/conflict.error";
import { CpfVO } from "@/core/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/core/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { UserMapper } from "@/modulos/user/infrastructure/mappers/prisma/user-prisma.mapper";

import { PhoneVO } from "@/core/domain/values-objects/phone/phone.vo";
import { CreateAccountInputDto } from "../dto/create-account.input.ts";
import { CreateAccountOutputDto } from "../dto/create-account.output";

export type CreateAccountUseCaseResult = Either<
  ConflictError,
  { user: CreateAccountOutputDto }
>;

export class CreateAccountUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly bcryptHasher: BcryptHasher = new BcryptHasher(),
  ) {}

  async execute(
    input: CreateAccountInputDto,
  ): Promise<CreateAccountUseCaseResult> {
    // ✅ validações FORA da transação — apenas leitura, sem side effects
    const [authWithSameEmail, userWithSameCpf] = await Promise.all([
      this.accountRepository.findByEmail(input.email),
      this.userRepository.findByCpf(input.cpf),
    ]);

    if (userWithSameCpf) {
      return left(
        new ConflictError(`ValidatorMessage.DUPLICATE_VALUE: ${input.cpf}`),
      );
    }

    if (authWithSameEmail) {
      return left(
        new ConflictError(`ValidatorMessage.DUPLICATE_VALUE: ${input.email}`),
      );
    }

    const hashedPassword = await this.bcryptHasher.hash(input.passwordHash);

    const newUser = UserEntity.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: EmailVO.create(input.email),
      phoneNumber: PhoneVO.create(input.phoneNumber),
      cpf: new CpfVO(input.cpf),
    });

    const newAccount = AccountEntity.create({
      userId: newUser.id,
      passwordHash: hashedPassword,
      provider: "credentials",
      providerAccountId: UUIDVO.create(newUser.id.getValue()),
    });

    console.log("User and account created successfully:", {
      user: {
        ...newUser,
        id: newUser.id.getValue(),
        email: newUser.email.toString(),
        phone: newUser.phoneNumber?.getValue(),
        cpf: newUser.cpf.getValue(),
      },
      account: {
        ...newAccount,
        userId: newAccount.userId.getValue(),
        providerAccountId: newAccount.providerAccountId.toString(),
      },
    });
    // ✅ transação apenas nos writes, passando tx para os repositórios
    const [saveUser] = await prisma.$transaction(async (tx) => {
      const user = await this.userRepository.createWithTx(newUser, tx);
      await this.accountRepository.createWithTx(newAccount, tx);
      return [user];
    });

    return right({
      user: UserMapper.toOutput(saveUser),
    });
  }
}
