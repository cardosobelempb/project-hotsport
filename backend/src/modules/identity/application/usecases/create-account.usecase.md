import { Either } from "@/common/domain/errors/handle-errors/either";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { AccountSummaryDto } from "../dto/account.dto";

export type CreateAccountUseCaseResponse = Either<
  AlreadyExistsError,
  AccountSummaryDto
>;

export class CreateAccountUseCase {
  constructor() {}

  async execute(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<CreateAccountUseCaseResponse> {
    // Lógica para criar uma nova conta
  }
}
