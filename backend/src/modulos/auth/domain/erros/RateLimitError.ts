import { ErrorCode, IServiceError, StandardError } from "@/common";

export class RateLimitError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: "RateLimitError",
      message: ErrorCode.RATE_LIMIT_ERROR,
      statusCode: 429,
      path,
    });
  }
}
