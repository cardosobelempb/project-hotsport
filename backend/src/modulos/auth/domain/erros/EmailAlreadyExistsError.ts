import { ErrorCode, StandardError, UseCaseError } from "@/core";

export class EmailAlreadyExistsError
  extends StandardError
  implements UseCaseError
{
  constructor(public readonly path: string = "/register") {
    super({
      error: "EmailAlreadyExistsError",
      message: ErrorCode.CONFLICT_ERROR,
      statusCode: 409,
      path,
    });
  }
}
