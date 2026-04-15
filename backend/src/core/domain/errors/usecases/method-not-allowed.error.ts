import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class MethodNotAllowedError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "MethodNotAllowedError",
      message: CodeError.METHOD_NOT_ALLOWED,
      statusCode: 405,
      path,
    });
  }
}
