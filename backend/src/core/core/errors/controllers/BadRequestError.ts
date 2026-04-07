import { ErrorCode } from '../services'
import { StandardError } from '../StandardError'
import { IControllerError } from './IControllerError'

export class BadRequestError extends StandardError implements IControllerError {
  constructor(path: string) {
    super({
      error: 'BadRequestError',
      message: ErrorCode.BAD_REQUEST,
      statusCode: 400,
      path,
    })
  }
}
