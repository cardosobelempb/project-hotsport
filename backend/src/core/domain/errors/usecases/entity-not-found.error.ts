import { StandardError } from "../standard.errror";
import { BaseUseCaseError } from "./base-usecase.error.ts";
import { CodeError } from "./code.error";

export class EntityNotFoundError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "EntityNotFoundError",
      message: CodeError.ENTITY_NOT_FOUND,
      statusCode: 400,
      path,
    });
  }
}
