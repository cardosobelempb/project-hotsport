import { BaseUseCaseError } from "@/common/application/errors/base-usecase.error";
import { StandardError } from "@/common/domain/errors/standard.errror";
import { CodeError } from "@/common/domain/errors/usecases/code.error";

export class HotspotUserBlockedError
  extends StandardError
  implements BaseUseCaseError
{
  constructor(path: string) {
    super({
      error: "HotspotUserBlockedError",
      message: CodeError.CONFLICT,
      statusCode: 409,
      path,
    });
  }
}
