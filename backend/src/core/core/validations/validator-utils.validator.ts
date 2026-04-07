import { FieldMessage, MethodArgumentNotValidError } from '../errors'
import { ValidErrors } from './valid-errors.validator'
import { ValidationErrors } from './validation-errors.validator'
import { ValidatorMessage } from './ValidatorMessage'

export class ValidatorUtils {
  private constructor() {}

  static throwOnError(validErrors: ValidErrors): void {
    if (validErrors.hasErrors()) {
      throw new MethodArgumentNotValidError(ValidErrors.toString())
    }
  }

  static validMinLength(
    fieldName: string,
    minLength: number,
    validErrors: ValidErrors,
  ): boolean {
    if (fieldName?.trim().length < minLength) {
      validErrors.addErrors(
        fieldName,
        `${ValidatorMessage.MIN_LENGTH}${minLength} caracteres`,
      )
      return false
    }
    return true
  }

  static validMaxLength(
    fieldName: string,
    maxLength: number,
    FieldMessages: FieldMessage[],
  ): boolean {
    if (fieldName?.trim().length > maxLength) {
      FieldMessages.push(
        new FieldMessage(
          fieldName,
          `${ValidatorMessage.MIN_LENGTH}${maxLength} caracteres`,
        ),
      )
      return false
    }
    return true
  }

  static validateRequired(
    fieldName: string,
    validErrors: ValidErrors,
  ): boolean {
    if (!fieldName?.trim()) {
      validErrors.addErrors(
        fieldName,
        `${fieldName}${ValidatorMessage.REQUIRED_FIELD}`,
      )
      return false
    }
    return true
  }

  static validateRequiredObject(
    field: unknown,
    fieldName: string,
    validErrors: ValidationErrors,
  ): boolean {
    if (field === null || field === undefined) {
      validErrors.addErrors(fieldName, ValidatorMessage.REQUIRED_FIELD)
      return false
    }
    return true
  }

  static validateMaxLength(
    field: string,
    fieldName: string,
    maxLength: number,
    ValidateErrors: ValidationErrors,
  ): boolean {
    if (field?.trim().length > maxLength) {
      ValidateErrors.addErrors(
        fieldName,
        `${ValidatorMessage.MAX_LENGTH}${maxLength} caracteres`,
      )
      return false
    }
    return true
  }

  static validateMinLength(
    field: string,
    fieldName: string,
    minLength: number,
    ValidateErrors: ValidationErrors,
  ): boolean {
    if (field?.trim().length < minLength) {
      ValidateErrors.addErrors(
        fieldName,
        `${ValidatorMessage.MIN_LENGTH}${minLength} caracteres`,
      )
      return false
    }
    return true
  }

  static validateMaxValueValid(
    field: number | null,
    fieldName: string,
    maxValue: number,
    ValidateErrors: ValidationErrors,
  ): boolean {
    if (field !== null && field !== undefined && field > maxValue) {
      ValidateErrors.addErrors(fieldName, ValidatorMessage.MAX_VALUE)
      return false
    }
    return true
  }

  static validateMinValueValid(
    field: number | null,
    fieldName: string,
    minValue: number,
    ValidateErrors: ValidationErrors,
  ): boolean {
    if (field !== null && field !== undefined && field < minValue) {
      ValidateErrors.addErrors(fieldName, ValidatorMessage.MIN_VALUE)
      return false
    }
    return true
  }
}
