import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class UnprocessableEntityError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "UnprocessableEntityError",
      message: CodeError.UNPROCESSABLE_ENTITY,
      statusCode: 422,
      path,
    });
  }
}
