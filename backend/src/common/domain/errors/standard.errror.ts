export class StandardError extends Error {
  readonly timestamp: Date;
  readonly statusCode: number;
  readonly error: string;
  readonly path?: string | null; // ✅ opcional — nem sempre disponível no momento do throw

  constructor(params: {
    timestamp?: Date;
    statusCode?: number;
    error: string;
    message: string;
    path?: string; // ✅ opcional
  }) {
    super(params.message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.timestamp = params.timestamp ?? new Date();
    this.statusCode = params.statusCode ?? 400;
    this.error = params.error;
    this.path = params.path ?? null; // ✅ só define se for passado, senão fica undefined
  }

  toJSON() {
    return {
      name: this.name,
      error: this.error,
      message: this.message,
      statusCode: this.statusCode,
      path: this.path,
      timestamp: this.timestamp.toISOString(), // ✅ ISO string — consistente com o error handler
    };
  }
}
