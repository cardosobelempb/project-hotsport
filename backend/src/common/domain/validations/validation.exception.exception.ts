import { StandardError } from "../errors/standard.errror";
import { BaseUseCaseError } from "../errors/usecases/base-usecase.error.ts";

export class ValidationException
  extends StandardError
  implements BaseUseCaseError
{
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 400,
      code: "ValidationException ",
      error: "Validation Error",
      message:
        params.message ?? `${params.fieldName} "${params.value}" já existe`,
      fieldName: params.fieldName,
    });
  }
}
