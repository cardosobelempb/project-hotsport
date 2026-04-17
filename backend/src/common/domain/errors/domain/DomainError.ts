import { CodeError } from "@/core/domain/errors/usecases/code.error";
import { StandardError } from "../StandardError";
import { IDomainError } from "./IDomainError";

export class DomainError extends StandardError implements IDomainError {
  constructor(path: string) {
    super({
      error: "BadRequestError",
      message: CodeError.NOT_ALLOWED,
      statusCode: 403,
      path,
    });
  }
}
