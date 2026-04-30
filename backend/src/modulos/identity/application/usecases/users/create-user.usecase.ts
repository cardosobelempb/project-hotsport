import { Either, left, right } from "@/common/domain/errors/handle-errors";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UserEntity } from "@/modulos/identity/domain/entities/user.entity";
import { UserMapper } from "@/modulos/identity/domain/mappers/user-mapper";
import { UserRepository } from "@/modulos/identity/domain/repositories/user.repository";
import { CreateUserInput } from "@/modulos/identity/infrastructure/http/schemas/user.schema";
import { UserPresenterDto } from "../../dto/user.dto";

export type UserRegisterUseCaseResult = Either<
  AlreadyExistsError,
  { user: UserPresenterDto }
>;

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(body: CreateUserInput): Promise<UserRegisterUseCaseResult> {
    // const userWithSameEmail = await this.userRepository.findByEmail(body.email);
    const userWithSameCpf = await this.userRepository.findByCpf(body.cpf);

    if (userWithSameCpf) {
      return left(
        new AlreadyExistsError({
          fieldName: "cpf",
          value: body.cpf,
          message: `CPF "${body.cpf}" já existe`,
        }),
      );
    }

    // if (userWithSameEmail) {
    //   return left(new UserAlreadyExistsError(body.email));
    // }

    const user = UserEntity.create({
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: PhoneVO.create(body.phoneNumber),
      cpf: new CpfVO(body.cpf),
      email: EmailVO.create(body.email),
    });

    await this.userRepository.save(user);

    return right({ user: UserMapper.toPresenter(user) });
  }
}
