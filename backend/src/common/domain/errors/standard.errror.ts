export class StandardError extends Error {
  readonly timestamp: Date;
  readonly statusCode: number;
  readonly code?: string;
  readonly error: string;
  readonly path?: string;
  readonly fieldName?: string;

  constructor(params: {
    timestamp?: Date;
    statusCode?: number;
    code?: string;
    error: string;
    message: string;
    path?: string;
    fieldName?: string;
  }) {
    super(params.message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.timestamp = params.timestamp ?? new Date();
    this.statusCode = params.statusCode ?? 400;
    this.code = params.code ?? this.name;
    this.error = params.error;

    // com exactOptionalPropertyTypes
    // só define se realmente existir
    if (params.path) {
      this.path = params.path;
    }

    if (params.fieldName) {
      this.fieldName = params.fieldName;
    }
  }

  toJSON() {
    const response: {
      name: string;
      statusCode: number;
      code?: string;
      error: string;
      message: string;
      path?: string;
      fieldName?: string;
      timestamp: string;
    } = {
      name: this.name,
      statusCode: this.statusCode,
      error: this.error,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
    };

    if (this.code) {
      response.code = this.code;
    }

    if (this.path) {
      response.path = this.path;
    }

    if (this.fieldName) {
      response.fieldName = this.fieldName;
    }

    return response;
  }
}
