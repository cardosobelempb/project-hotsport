import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class UnsupportedMediaTypeError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "UnsupportedMediaTypeError",
      message: CodeError.UNSUPPORTED_MEDIA_TYPE,
      statusCode: 415,
      path,
    });
  }
}
