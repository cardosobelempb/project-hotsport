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
    return this;
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

  getIssues() {
    return this.fieldErrors.map((error) => ({
      field: error.fieldName,
      message: error.message,
    }));
  }

  get firstFieldName(): string | undefined {
    return this.getIssues()[0]?.field;
  }

  toJSON() {
    const issues = this.getIssues();

    return {
      ...super.toJSON(),
      ...(this.firstFieldName && { fieldName: this.firstFieldName }),
      ...(issues.length > 0 && { issues }),
    };
  }
}
