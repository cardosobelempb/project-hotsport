import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class ConflictError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'ConflictError',
      message: ErrorCode.CONFLICT_ERROR,
      statusCode: 409,
      path,
    })
  }
}
