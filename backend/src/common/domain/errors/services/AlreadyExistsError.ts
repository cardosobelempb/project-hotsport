import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class AlreadyExistsError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'AlreadyExistsError',
      message: ErrorCode.DUPLICATE_ERROR,
      statusCode: 409,
      path,
    })
  }
}
