import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class ConflictError extends StandardError implements BaseUseCaseError {
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 409,
      code: CodeError.CONFLICT,
      error: "ConflictError",
      message:
        params.message ?? `${params.fieldName} "${params.value}" já existe`,
      fieldName: params.fieldName,
    });
  }
}
