import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class UnprocessableEntityError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'UnprocessableEntityError',
      message: ErrorCode.UNPROCESSABLE_ENTITY,
      statusCode: 422,
      path,
    })
  }
}
