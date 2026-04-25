import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { UserRepository } from "@/modulos/user/domain/repositories/user.repository";
import { AccountEntity } from "../../domain/entities/account.entity";
import { AccountRepository } from "../../domain/repositories/account-repository";

import { prisma } from "@/shared/lib/db";
import { BcryptHasher } from "../../../../shared/cryptography/bcrypt-hasher";

import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";
import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { UserMapper } from "@/modulos/user/domain/mappers/user-mapper";
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
        new ConflictError({
          fieldName: "cpf",
          value: input.cpf,
          message: `Cpf "${input.cpf}" já existe`,
        }),
      );
    }

    if (authWithSameEmail) {
      return left(
        new ConflictError({
          fieldName: "email",
          value: input.email,
          message: `Email "${input.email}" já existe`,
        }),
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
