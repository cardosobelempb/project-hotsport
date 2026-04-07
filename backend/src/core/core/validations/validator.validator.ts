// src/utils/ValidatorUtils.ts

export interface ValidateErrors {
  [field: string]: string[]
}

export class ValidatorUtils {
  private constructor() {} // impede instanciação

  static validateRequired(
    field: unknown,
    fieldName: string,
    validationErrors: ValidateErrors,
  ): boolean {
    const isEmpty =
      field === null ||
      field === undefined ||
      (typeof field === 'string' && field.trim().length === 0)

    if (isEmpty) {
      this.addError(validationErrors, fieldName, `${fieldName} is required`)
      return false
    }
    return true
  }

  static validateMaxLength(
    field: string | null | undefined,
    fieldName: string,
    maxLength: number,
    validationErrors: ValidateErrors,
  ): boolean {
    if (field && field.trim().length > maxLength) {
      this.addError(
        validationErrors,
        fieldName,
        `${fieldName} exceeds max length`,
      )
      return false
    }
    return true
  }

  static validateMaxValue(
    field: number | null | undefined,
    fieldName: string,
    maxValue: number,
    validationErrors: ValidateErrors,
  ): boolean {
    if (field !== null && field !== undefined && field > maxValue) {
      this.addError(
        validationErrors,
        fieldName,
        `${fieldName} exceeds max value`,
      )
      return false
    }
    return true
  }

  static validateMinValue(
    field: number | null | undefined,
    fieldName: string,
    minValue: number,
    validationErrors: ValidateErrors,
  ): boolean {
    if (field !== null && field !== undefined && field < minValue) {
      this.addError(
        validationErrors,
        fieldName,
        `${fieldName} is below min value`,
      )
      return false
    }
    return true
  }

  private static addError(
    validationErrors: ValidateErrors,
    fieldName: string,
    message: string,
  ) {
    if (!validationErrors[fieldName]) {
      validationErrors[fieldName] = []
    }
    validationErrors[fieldName].push(message)
  }
}

/*
const errors: ValidateErrors = {};

ValidatorUtils.validateRequired("", "username", errors);
ValidatorUtils.validateMaxLength("This is too long", "bio", 10, errors);

console.log(errors);
{
  username: ["username is required"],
  bio: ["bio exceeds max length"]
}
*/
