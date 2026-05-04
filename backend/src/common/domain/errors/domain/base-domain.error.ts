import { StandardError } from "../standard.errror";
import { CodeError } from "../usecases/code.error";
import { BaseDomainError } from "./domain.error";

export class DomainError extends StandardError implements BaseDomainError {
  constructor(path: string) {
    super({
      error: "BadRequestError",
      message: CodeError.METHOD_NOT_ALLOWED,
      statusCode: 403,
      path,
    });
  }
}
