import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class UnauthorizedError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 401,
      code: CodeError.UNAUTHORIZED,
      error: "UnauthorizedError",
      message:
        params.message ??
        `${params.fieldName} "${params.value}" não autorizado`,
      fieldName: params.fieldName,
    });
  }
}
