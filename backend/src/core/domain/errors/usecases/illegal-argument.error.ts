import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class IllegalArgumentError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "IllegalArgumentError",
      message: CodeError.NOT_FOUND,
      statusCode: 400,
      path,
    });
  }
}
