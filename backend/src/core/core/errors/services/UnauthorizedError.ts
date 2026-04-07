import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class UnauthorizedError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'UnauthorizedError',
      message: ErrorCode.UNAUTHORIZED,
      statusCode: 401,
      path,
    })
  }
}
