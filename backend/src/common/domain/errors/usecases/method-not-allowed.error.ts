import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class MethodNotAllowedError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 405,
      error: CodeError.METHOD_NOT_ALLOWED,
      message:
        params.message ?? `${params.fieldName} "${params.value}" já existe`,
      fieldName: params.fieldName,
    });
  }
}
