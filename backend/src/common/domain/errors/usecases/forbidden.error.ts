import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class ForbiddenError extends StandardError implements BaseUseCaseError {
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 403,
      code: CodeError.FORBIDDEN,
      error: "ForbiddenError",
      message:
        params.message ??
        `${params.fieldName} "${params.value}" não tem permissão para acessar este recurso`,
      fieldName: params.fieldName,
    });
  }
}
