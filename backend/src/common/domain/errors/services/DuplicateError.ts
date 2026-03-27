import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class DuplicateError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'DuplicateError',
      message: ErrorCode.DUPLICATE_ERROR,
      statusCode: 409,
      path,
    })
  }
}
