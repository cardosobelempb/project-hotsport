import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class UnauthorizedError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "UnauthorizedError",
      message: CodeError.UNAUTHORIZED,
      statusCode: 401,
      path,
    });
  }
}
