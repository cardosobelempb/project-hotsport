import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class DataIntegrityViolationError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'DataIntegrityViolationError',
      message: ErrorCode.DATA_INTEGRITY_VIOLATION,
      statusCode: 409,
      path,
    })
  }
}
