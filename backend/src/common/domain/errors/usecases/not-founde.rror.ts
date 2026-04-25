import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class NotFoundError extends StandardError implements BaseUseCaseError {
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 409,
      code: CodeError.NOT_FOUND,
      error: "NotFoundError",
      message:
        params.message ??
        `${params.fieldName} "${params.value}" não encontrado`,
      fieldName: params.fieldName,
    });
  }
}
