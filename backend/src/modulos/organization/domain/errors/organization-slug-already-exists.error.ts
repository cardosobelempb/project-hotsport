import { StandardError } from "@/core/domain/errors/standard.errror";
import { BaseUseCaseError } from "@/core/domain/errors/usecases/base-usecase.error.ts";
import { CodeError } from "@/core/domain/errors/usecases/code.error";

export class OrganizationSlugAlreadyExistsError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "OrganizationNotFoundError",
      message: CodeError.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
