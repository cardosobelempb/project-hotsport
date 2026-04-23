import { IDomainError } from "@/common/domain/errors/domain/IDomainError";
import { StandardError } from "@/common/domain/errors/StandardError";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class VoucherExpiredError extends StandardError implements IDomainError {
  constructor(path: string) {
    super({
      error: "VoucherExpiredError",
      message: CodeError.BAD_REQUEST,
      statusCode: 400,
      path,
    });
  }
}
