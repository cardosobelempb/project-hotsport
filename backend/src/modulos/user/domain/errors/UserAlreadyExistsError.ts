import { ErrorCode, StandardError, UseCaseError } from "@/core";

export class UserAlreadyExistsError
  extends StandardError
  implements UseCaseError
{
  constructor(public readonly path: string = "/users/register") {
    super({
      error: "UserAlreadyExistsError",
      message: ErrorCode.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
