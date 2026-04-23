import { IDomainError } from "@/common/domain/errors/domain/IDomainError";
import { StandardError } from "@/common/domain/errors/StandardError";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class InvalidVoucherTransitionError
  extends StandardError
  implements IDomainError
{
  constructor(path: string) {
    super({
      error: "InvalidVoucherTransitionError",
      message: CodeError.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
