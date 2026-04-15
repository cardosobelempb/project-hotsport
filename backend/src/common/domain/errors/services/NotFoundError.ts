import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class NotFoundError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'ConflictError',
      message: ErrorCode.CONFLICT_ERROR,
      statusCode: 404,
      path,
    })
  }
}
