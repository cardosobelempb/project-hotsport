import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class ForbiddenError extends StandardError implements BaseUseCaseError {
  constructor(path: string) {
    super({
      error: "ForbiddenError",
      message: CodeError.FORBIDDEN,
      statusCode: 403,
      path,
    });
  }
}
