import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class ResourceNotFoundError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "ResourceNotFoundError",
      message: CodeError.NOT_FOUND,
      statusCode: 404,
      path,
    });
  }
}
