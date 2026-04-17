import { IDomainError } from "@/common/domain/errors/domain/IDomainError";
import { StandardError } from "@/core/domain/errors/standard.errror";
import { CodeError } from "@/core/domain/errors/usecases/code.error";

export class CannotDemoteOwnerError
  extends StandardError
  implements IDomainError
{
  constructor(path: string) {
    super({
      error: "CannotDemoteOwnerError",
      message: CodeError.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
