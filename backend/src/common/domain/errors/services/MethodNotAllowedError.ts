import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class MethodNotAllowedError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'MethodNotAllowedError',
      message: ErrorCode.METHOD_NOT_ALLOWED,
      statusCode: 405,
      path,
    })
  }
}
