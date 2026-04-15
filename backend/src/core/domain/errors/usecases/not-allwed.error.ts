import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class NotAllwedError extends StandardError implements BaseUseCaseError {
  constructor(path: string) {
    super({
      error: "NotAllwedError",
      message: CodeError.NOT_ALLOWED,
      statusCode: 405,
      path,
    });
  }
}
