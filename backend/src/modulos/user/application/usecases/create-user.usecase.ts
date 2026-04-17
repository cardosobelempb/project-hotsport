import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { UserEntity } from "../../domain/entities/user.entity";

import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error";
import { CpfVO } from "@/core/domain/values-objects/cpf/cpf.vo";
import { EmailVO } from "@/core/domain/values-objects/email/email.vo";
import { PhoneVO } from "@/core/domain/values-objects/phone/phone.vo";
import { UserRepository } from "../../domain/repositories/user.repository";

import { UserMapper } from "../../domain/mappers/user-mapper";
import { UserInputDto, UserOutputDto } from "../dto/user.dto";
export type UserRegisterUseCaseResult = Either<
  AlreadyExistsError,
  { user: UserOutputDto }
>;

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(body: UserInputDto): Promise<UserRegisterUseCaseResult> {
    // const userWithSameEmail = await this.userRepository.findByEmail(body.email);
    const userWithSameCpf = await this.userRepository.findByCpf(body.cpf);

    if (userWithSameCpf) {
      return left(new AlreadyExistsError(body.cpf));
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

    return right({ user: UserMapper.toOutput(user) });
  }
}
