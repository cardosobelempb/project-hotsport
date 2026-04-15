import { StandardError } from '../StandardError'
import { ErrorCode } from './ErrorCode'
import { IServiceError } from './IServiceError'

export class UnsupportedMediaTypeError
  extends StandardError
  implements IServiceError
{
  constructor(path: string) {
    super({
      error: 'UnsupportedMediaTypeError',
      message: ErrorCode.UNSUPPORTED_MEDIA_TYPE,
      statusCode: 415,
      path,
    })
  }
}
