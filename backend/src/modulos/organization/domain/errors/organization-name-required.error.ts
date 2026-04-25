import { BaseUseCaseError } from "@/common/application/errors/base-usecase.error";
import { StandardError } from "@/common/domain/errors/standard.errror";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class OrganizationNameRequiredError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "OrganizationNameRequiredError",
      message: CodeError.BAD_REQUEST,
      statusCode: 400,
      path,
    });
  }
}
