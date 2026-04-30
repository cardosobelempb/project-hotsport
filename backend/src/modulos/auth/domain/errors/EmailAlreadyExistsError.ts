import { BaseUseCaseError } from "@/common/application/errors/base-usecase.error";
import { StandardError } from "@/common/domain/errors/standard.errror";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class EmailAlreadyExistsError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(public readonly path: string = "/register") {
    super({
      error: "EmailAlreadyExistsError",
      message: CodeError.CONFLICT,
      statusCode: 409,
      path,
    });
  }
}
