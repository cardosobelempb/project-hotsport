import { FieldMessage } from "./field-message.error";
import { StandardError } from "./standard.errror";

export class ValidationError extends StandardError {
  private readonly fieldErrors: FieldMessage[] = [];

  constructor(path?: string, statusCode = 400) {
    super({
      error: "Validation Error",
      message: "Dados inválidos",
      statusCode,
      ...(path && { path }),
    });
  }

  addFieldError(fieldName: string, message: string): this {
    this.fieldErrors.push(new FieldMessage({ fieldName, message }));
    return this; // ✅ fluent API: permite encadear .addFieldError().addFieldError()
  }

  getFieldErrors(): ReadonlyArray<FieldMessage> {
    return [...this.fieldErrors];
  }

  hasErrors(): boolean {
    return this.fieldErrors.length > 0;
  }

  getErrorMessages(): string[] {
    return this.fieldErrors.map((e) => e.message);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.getFieldErrors(),
    };
  }
}
