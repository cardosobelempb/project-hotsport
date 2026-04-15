import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class EntityNotFoundError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'EntityNotFoundError',
      message: ErrorCode.ENTITY_NOT_FOUND,
      statusCode: 400,
      path,
    })
  }
}
