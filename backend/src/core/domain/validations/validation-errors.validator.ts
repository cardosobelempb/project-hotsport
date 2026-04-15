import { ValidError } from './valid-error.validator'

export class ValidationErrors implements Iterable<ValidError> {
  private readonly ValidErrors: ValidError[] = []

  constructor() {}

  addErrors(field: string, errorCode: string): ValidationErrors
  addErrors(error: ValidError): ValidationErrors
  addErrors(arg1: string | ValidError, arg2?: string): ValidationErrors {
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      this.ValidErrors.push(new ValidError(arg1, arg2))
    } else if (arg1 instanceof ValidError) {
      this.ValidErrors.push(arg1)
    }
    return this
  }

  getErrorIndex(index: number): ValidError {
    const error = this.ValidErrors[index]
    if (!error) {
      throw new Error(`No error found at index ${index}`)
    }
    return error
  }

  getNumberOfErrors(): number {
    return this.ValidErrors.length
  }

  hasErrors(): boolean {
    return this.ValidErrors.length > 0
  }

  toString(): string {
    return `ValidationErrors{validationErrorsList=${JSON.stringify(this.ValidErrors)}}`
  }

  [Symbol.iterator](): Iterator<ValidError> {
    return this.ValidErrors[Symbol.iterator]()
  }
}
