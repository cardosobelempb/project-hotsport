import { StandardError } from "../standard.errror";
import { CodeError } from "../usecases/code.error";

import { BaseControllerError } from "./base-controller.error";

export class BadRequestError
  extends StandardError
  implements BaseControllerError
{
  constructor(path: string) {
    super({
      error: "BadRequestError",
      message: CodeError.BAD_REQUEST,
      statusCode: 400,
      path,
    });
  }
}
