import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class DuplicateError extends StandardError implements BaseUseCaseError {
  constructor(path: string) {
    super({
      error: "DuplicateError",
      message: CodeError.DUPLICATE_ERROR,
      statusCode: 409,
      path,
    });
  }
}
