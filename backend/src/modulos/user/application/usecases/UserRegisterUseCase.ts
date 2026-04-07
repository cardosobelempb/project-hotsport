import { left, right } from "@/core";

import { UserEntity } from "../../domain/entities/user.entity";
import { UserAlreadyExistsError } from "../../domain/errors/UserAlreadyExistsError";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { UserRegisterPresenter } from "../../infrastructure/presentation/user-register.present";
import { UserRegisterBodyType } from "../../infrastructure/schemas/user-register.schema";

export class UserRegisterUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(body: UserRegisterBodyType): Promise<UserRegisterPresenter> {
    // const userWithSameEmail = await this.userRepository.findByEmail(body.email);
    const userWithSameCpf = await this.userRepository.findByCpf(body.cpf);

    if (userWithSameCpf) {
      return left(new UserAlreadyExistsError(body.cpf));
    }

    // if (userWithSameEmail) {
    //   return left(new UserAlreadyExistsError(body.email));
    // }

    const user = UserEntity.create({
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      cpf: body.cpf,
    });

    await this.userRepository.save(user);

    return right({ user });
  }
}
