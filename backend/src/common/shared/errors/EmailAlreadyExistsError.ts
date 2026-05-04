import { StandardError } from "@/core/domain/errors/standard.errror";
import { BaseUseCaseError } from "@/core/domain/errors/usecases/base-usecase.error.ts";
import { CodeError } from "@/core/domain/errors/usecases/code.error";

export class EmailAlreadyExistsError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(public readonly path: string = "/register") {
    super({
      error: "EmailAlreadyExistsError",
      message: CodeError.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
