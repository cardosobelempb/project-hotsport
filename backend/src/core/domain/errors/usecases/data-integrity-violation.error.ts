import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class DataIntegrityViolationError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "DataIntegrityViolationError",
      message: CodeError.DATA_INTEGRITY_VIOLATION,
      statusCode: 409,
      path,
    });
  }
}
