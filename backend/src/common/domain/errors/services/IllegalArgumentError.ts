import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class IllegalArgumentError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'IllegalArgumentError',
      message: ErrorCode.NOT_FOUND,
      statusCode: 400,
      path,
    })
  }
}
