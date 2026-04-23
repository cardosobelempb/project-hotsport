import { IDomainError } from "@/common/domain/errors/domain/IDomainError";
import { StandardError } from "@/common/domain/errors/StandardError";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class ConsentMustAcceptTermsError
  extends StandardError
  implements IDomainError
{
  constructor(path: string) {
    super({
      error: "ConsentMustAcceptTermsError",
      message: CodeError.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
