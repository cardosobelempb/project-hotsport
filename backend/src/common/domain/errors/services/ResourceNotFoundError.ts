import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class ResourceNotFoundError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'ResourceNotFoundError',
      message: ErrorCode.NOT_FOUND,
      statusCode: 404,
      path,
    })
  }
}
