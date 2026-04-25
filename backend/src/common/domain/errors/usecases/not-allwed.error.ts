import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class NotAllwedError extends StandardError implements BaseUseCaseError {
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 409,
      code: CodeError.METHOD_NOT_ALLOWED,
      error: "NotAllwedError",
      message:
        params.message ?? `${params.fieldName} "${params.value}" não permitido`,
      fieldName: params.fieldName,
    });
  }
}
