import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class AlreadyExistsError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "AlreadyExistsError",
      message: CodeError.DUPLICATE_ERROR,
      statusCode: 409,
      path,
    });
  }
}
