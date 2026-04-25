import { StandardError } from "../standard.errror";
import { CodeError } from "../usecases/code.error";

import { BaseControllerError } from "./base-controller.error";

export class BadRequestError
  extends StandardError
  implements BaseControllerError
{
  constructor(params: { fieldName: string; value?: string; message?: string }) {
    super({
      statusCode: 400,
      code: CodeError.BAD_REQUEST,
      error: "BadRequestError",
      message:
        params.message ??
        `${params.fieldName} "${params.value}" é inválido ou está faltando`,
      fieldName: params.fieldName,
    });
  }
}
