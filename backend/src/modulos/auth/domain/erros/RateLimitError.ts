import { BaseUseCaseError } from "@/common/application/errors/base-usecase.error";
import { StandardError } from "@/common/domain/errors/standard.errror";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class RateLimitError extends StandardError implements BaseUseCaseError {
  constructor(path: string) {
    super({
      error: "RateLimitError",
      message: CodeError.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
      path,
    });
  }
}
