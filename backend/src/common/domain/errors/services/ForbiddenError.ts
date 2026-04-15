import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class ForbiddenError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'ForbiddenError',
      message: ErrorCode.FORBIDDEN,
      statusCode: 403,
      path,
    })
  }
}
