import { ValidFieldMessage } from './valid-field-message.validator'

export class ValidErrors implements Iterable<ValidFieldMessage> {
  private readonly ValidFieldMessages: ValidFieldMessage[] = []

  constructor() {}

  addErrors(field: string, messageError: string): ValidErrors
  addErrors(error: ValidFieldMessage): ValidErrors
  addErrors(arg1: string | ValidFieldMessage, arg2?: string): ValidErrors {
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      this.ValidFieldMessages.push(new ValidFieldMessage(arg1, arg2))
    } else if (arg1 instanceof ValidFieldMessage) {
      this.ValidFieldMessages.push(arg1)
    }
    return this
  }

  getErrorIndex(index: number): ValidFieldMessage {
    const error = this.ValidFieldMessages[index]
    if (!error) {
      throw new Error(`No error found at index ${index}`)
    }
    return error
  }

  getNumberOfErrors(): number {
    return this.ValidFieldMessages.length
  }

  hasErrors(): boolean {
    return this.ValidFieldMessages.length > 0
  }

  toString(): string {
    return `ValidateErrors{validationErrorsList=${JSON.stringify(this.ValidFieldMessages)}}`
  }

  [Symbol.iterator](): Iterator<ValidFieldMessage> {
    return this.ValidFieldMessages[Symbol.iterator]()
  }
}
