import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class NotAllwedError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: 'NotAllwedError',
      message: ErrorCode.NOT_ALLOWED,
      statusCode: 405,
      path,
    })
  }
}
