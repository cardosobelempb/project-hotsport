import { StandardError } from "@/core/domain/errors/standard.errror";
import { BaseUseCaseError } from "@/core/domain/errors/usecases/base-usecase.error.ts";
import { CodeError } from "@/core/domain/errors/usecases/code.error";

export class InvalidOrganizationSlugError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "InvalidOrganizationSlugError",
      message: CodeError.BAD_REQUEST,
      statusCode: 400,
      path,
    });
  }
}
