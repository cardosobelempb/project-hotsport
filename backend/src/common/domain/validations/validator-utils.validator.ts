import { ValidationErrors } from "./validation-errors.validator";
import { ValidationException } from "./validation.exception.exception";
import { ValidatorMessage } from "./ValidatorMessage";

export class ValidatorUtils {
  private constructor() {}

  static throwOnError(errors: ValidationErrors): void {
    if (errors.hasErrors()) {
      throw new ValidationException({
        fieldName: "validation",
        message: errors.toString(),
      });
    }
  }

  static validateRequired(
    value: string | null | undefined,
    fieldName: string,
    errors: ValidationErrors,
  ): boolean {
    if (!value?.trim()) {
      errors.addErrors(
        fieldName,
        `${fieldName} ${ValidatorMessage.REQUIRED_FIELD}`,
      );

      return false;
    }

    return true;
  }

  static validateMinLength(
    value: string | null | undefined,
    fieldName: string,
    minLength: number,
    errors: ValidationErrors,
  ): boolean {
    if (!value || value.trim().length < minLength) {
      errors.addErrors(
        fieldName,
        `${ValidatorMessage.MIN_LENGTH}${minLength} caracteres`,
      );

      return false;
    }

    return true;
  }

  static validateMaxLength(
    value: string | null | undefined,
    fieldName: string,
    maxLength: number,
    errors: ValidationErrors,
  ): boolean {
    if (value && value.trim().length > maxLength) {
      errors.addErrors(
        fieldName,
        `${ValidatorMessage.MAX_LENGTH}${maxLength} caracteres`,
      );

      return false;
    }

    return true;
  }

  static validateMinValue(
    value: number | null | undefined,
    fieldName: string,
    minValue: number,
    errors: ValidationErrors,
  ): boolean {
    if (value != null && value < minValue) {
      errors.addErrors(fieldName, ValidatorMessage.MIN_VALUE);

      return false;
    }

    return true;
  }

  static validateMaxValue(
    value: number | null | undefined,
    fieldName: string,
    maxValue: number,
    errors: ValidationErrors,
  ): boolean {
    if (value != null && value > maxValue) {
      errors.addErrors(fieldName, ValidatorMessage.MAX_VALUE);

      return false;
    }

    return true;
  }

  static validateRequiredObject(
    value: unknown,
    fieldName: string,
    errors: ValidationErrors,
  ): boolean {
    if (value == null) {
      errors.addErrors(fieldName, ValidatorMessage.REQUIRED_FIELD);

      return false;
    }

    return true;
  }
}
