import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class NotFoundError extends StandardError implements BaseUseCaseError {
  constructor(path: string) {
    super({
      error: "ConflictError",
      message: CodeError.CONFLICT_ERROR,
      statusCode: 404,
      path,
    });
  }
}
