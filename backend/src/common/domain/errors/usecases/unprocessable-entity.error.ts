import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";

export class UnprocessableEntityError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      error: "UnprocessableEntityError",
      statusCode: 422,
      message:
        params.message ?? `${params.fieldName} "${params.value}" já existe`,
      fieldName: params.fieldName,
    });
  }
}
